"use client";

import { useState, useTransition, useEffect, useMemo } from "react";
import {
  Search, Plus, Minus, Trash2, ShoppingCart, User,
  CreditCard, Banknote, Smartphone, Tag, Package,
  X, ChevronRight, Calculator, Printer, Monitor, SplitSquareHorizontal, Clock, ArrowLeftRight, Archive, ScanLine, Pizza, CupSoda, Receipt
} from "lucide-react";
import {
  getAllProductsForBilling,
  getAllCustomersForBilling,
  createInvoice,
  CartItem,
} from "@/app/actions/billing";
import { getTables, getRunningOrders, parkOrder, closeOrder, createTable } from "@/app/actions/tables";
import {
  getPendingOnlineOrders,
  acceptOnlineOrder,
  rejectOnlineOrder,
} from "@/app/actions/aggregator";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { KOTPrintReceipt, KOTData } from "./KOTPrintReceipt";

export function BillingCart() {
  const [query, setQuery] = useState("");
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [allCustomers, setAllCustomers] = useState<any[]>([]);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [isCheckingOut, startCheckout] = useTransition();
  const [isFetching, startFetching] = useTransition();
  const [viewMode, setViewMode] = useState<"PRODUCTS" | "TABLES" | "ONLINE">("PRODUCTS");
  const [tables, setTables] = useState<any[]>([]);
  const [onlineOrders, setOnlineOrders] = useState<any[]>([]);
  const [runningOrders, setRunningOrders] = useState<any[]>([]);
  const [activeTableId, setActiveTableId] = useState<number | null>(null);
  const [activeOrderId, setActiveOrderId] = useState<number | null>(null);
  const [showNewTableModal, setShowNewTableModal] = useState(false);
  const [newTableName, setNewTableName] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Checkout Modal States
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [selectedPaymentMode, setSelectedPaymentMode] = useState("Cash");
  const [selectedOrderMode, setSelectedOrderMode] = useState("DINE_IN");
  
  // KOT Printing
  const [printKotData, setPrintKotData] = useState<KOTData | null>(null);

  const router = useRouter();

  const loadTablesAndOrders = async () => {
    const [t, ro] = await Promise.all([getTables(), getRunningOrders()]);
    setTables(t);
    setRunningOrders(ro);
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchOnline = async () => {
      const data = await getPendingOnlineOrders();
      setOnlineOrders(data);
    };
    fetchOnline();
    const timer = setInterval(fetchOnline, 10000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    startFetching(async () => {
      const [prods, custs] = await Promise.all([
        getAllProductsForBilling(),
        getAllCustomersForBilling()
      ]);
      setAllProducts(prods);
      setAllCustomers(custs);
      await loadTablesAndOrders();
    });
  }, []);

  const filteredProducts = useMemo(() => {
    return allProducts.filter((p) => {
      const matchesSearch =
        query === "" ||
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        (p.barcode && p.barcode.includes(query));
      const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [allProducts, query, selectedCategory]);

  const categories = useMemo(() => {
    const cats = new Set(allProducts.map((p) => p.category).filter(Boolean));
    return ["All", ...Array.from(cats)];
  }, [allProducts]);

  const addToCart = (product: any) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        return prev.map((item) =>
          item.productId === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { 
        productId: product.id, 
        name: product.name, 
        price: product.price, 
        costPrice: product.costPrice, 
        qty: 1 
      }];
    });
    setQuery("");
  };

  const updateQty = (productId: number, delta: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.productId === productId
          ? { ...item, qty: Math.max(1, item.qty + delta) }
          : item
      )
    );
  };

  const removeFromCart = (productId: number) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setCustomerName("");
    setCustomerPhone("");
    setDiscountAmount(0);
    setShowCustomerForm(false);
    setActiveTableId(null);
    setActiveOrderId(null);
  };

  const loadOrderIntoCart = (order: any) => {
    const loadedCart = order.items.map((i: any) => ({
      productId: i.productId,
      name: i.product.name,
      price: i.price,
      costPrice: i.costPrice,
      qty: i.qty
    }));
    setCart(loadedCart);
    setActiveOrderId(order.id);
    setActiveTableId(order.tableId);
    setViewMode("PRODUCTS");
  };

  const handleParkOrder = async () => {
    if (cart.length === 0) return;
    if (!activeTableId) {
      toast.error("Please select a table to park the order");
      setViewMode("TABLES");
      return;
    }
    
    // Prepare print data
    const table = tables.find(t => t.id === activeTableId);
    setPrintKotData({
      tableId: activeTableId,
      tableName: table?.name || "Table " + activeTableId,
      orderId: activeOrderId,
      time: new Date().toLocaleTimeString(),
      items: cart.map(item => ({ name: item.name, qty: item.qty }))
    });

    startCheckout(async () => {
      const res = await parkOrder(activeTableId, cart, activeOrderId);
      if (res.error) {
        toast.error(res.error);
        setPrintKotData(null);
      } else {
        toast.success(activeOrderId ? "KOT Updated" : "KOT Sent to Kitchen");
        
        // Trigger print dialog after DOM has updated
        setTimeout(async () => {
          window.print();
          clearCart();
          setPrintKotData(null);
          await loadTablesAndOrders();
          setViewMode("TABLES");
        }, 100);
      }
    });
  };

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  const gstAmount = 0; // cart.reduce((acc, item) => acc + ((item.price * (item.gstRate || 0)) / 100) * item.qty, 0);
  const grandTotal = Math.max(0, subtotal + gstAmount - discountAmount);

  const handleCheckout = (paymentMethod: string) => {
    if (cart.length === 0) return;
    if (paymentMethod === "CREDIT" && !customerName) {
      toast.error("Customer name is required for Khata (Credit) payments.");
      setShowCustomerForm(true);
      return;
    }
    startCheckout(async () => {
      const result = await createInvoice(
        cart,
        { name: customerName, phone: customerPhone },
        { subtotal, gstRate: 0,
        gstAmount: gstAmount,
        discountAmount, total: grandTotal, paymentMethod, orderId: activeOrderId || undefined, orderMode: selectedOrderMode }
      );
      if (result.error) {
        toast.error(result.error);
      } else if (result.success && result.invoiceId) {
        if (activeOrderId) {
          await closeOrder(activeOrderId);
        }
        toast.success("Invoice created successfully!");
        clearCart();
        setCheckoutModalOpen(false);
        await loadTablesAndOrders();
        router.push(`/invoices/${result.invoiceId}`);
      }
    });
  };

  const paymentModes = [
    { label: "CASH", method: "Cash", icon: Banknote, color: "bg-emerald-500 hover:bg-emerald-600 text-white" },
    { label: "CARD", method: "Card", icon: CreditCard, color: "bg-indigo-500 hover:bg-indigo-600 text-white" },
    { label: "UPI", method: "UPI", icon: Smartphone, color: "bg-violet-500 hover:bg-violet-600 text-white" },
    { label: "SPLIT", method: "SPLIT", icon: SplitSquareHorizontal, color: "bg-amber-500 hover:bg-amber-600 text-white" },
    { label: "CREDIT", method: "CREDIT", icon: User, color: "bg-rose-500 hover:bg-rose-600 text-white" },
  ];

  return (
    <>
      <KOTPrintReceipt data={printKotData} />
      <div className="flex flex-col h-[calc(100vh-6.5rem)] w-full overflow-hidden text-foreground font-sans bg-card rounded-2xl border border-border shadow-sm print:hidden">
      
      {/* ── TOP SYSTEM STATUS BAR ── */}
      <div className="h-14 bg-muted border-b border-border text-muted-foreground flex items-center justify-between px-6 flex-shrink-0 z-10 rounded-t-2xl">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 bg-emerald-500 rounded-full animate-pulse shadow-sm" />
            <span className="font-bold tracking-widest uppercase text-xs text-foreground/90">Terminal 1</span>
          </div>
          <div className="h-4 w-px bg-slate-300" />
          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5 text-emerald-600"><Printer className="h-4 w-4" /> Ready</div>
            <div className="flex items-center gap-1.5 text-emerald-600"><ScanLine className="h-4 w-4" /> Ready</div>
          </div>
        </div>
        <div className="flex items-center gap-6 text-xs font-bold text-muted-foreground">
          <div className="flex items-center gap-1.5"><User className="h-4 w-4" /> Cashier: Admin</div>
          <div className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> {currentTime.toLocaleTimeString()}</div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="flex flex-row flex-1 overflow-hidden h-full">
        
        {/* ── 15% LEFT SIDEBAR: CATEGORIES ── */}
        <div className="w-[15%] bg-card border-r border-border flex flex-col flex-shrink-0 z-10">
          <div className="p-4 border-b border-border/50 flex-shrink-0">
            <div className="flex bg-secondary p-1 rounded-lg w-full">
              <button onClick={() => setViewMode("PRODUCTS")} className={`flex-[2] py-1.5 text-xs font-bold rounded-md transition-all ${viewMode === "PRODUCTS" ? "bg-card shadow text-indigo-600" : "text-muted-foreground"}`}>Products</button>
              <button onClick={() => setViewMode("TABLES")} className={`flex-[2] py-1.5 text-xs font-bold rounded-md transition-all ${viewMode === "TABLES" ? "bg-card shadow text-indigo-600" : "text-muted-foreground"}`}>Tables</button>
              <button onClick={() => setViewMode("ONLINE")} className={`flex-[1.5] py-1.5 text-xs font-bold rounded-md transition-all relative ${viewMode === "ONLINE" ? "bg-card shadow text-indigo-600" : "text-muted-foreground"}`}>
                Web
                {onlineOrders.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-rose-500 rounded-full animate-pulse border-2 border-card"></span>
                )}
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => { setSelectedCategory(cat); setViewMode("PRODUCTS"); }}
                className={`w-full flex items-center justify-between px-3 py-3 rounded-xl transition-all ${
                  selectedCategory === cat
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-transparent text-muted-foreground hover:bg-muted/80"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Tag className={`h-4 w-4 ${selectedCategory === cat ? "opacity-100" : "opacity-40"}`} />
                  <span className="font-bold text-sm">{cat}</span>
                </div>
                <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${selectedCategory === cat ? "bg-white/20 text-white" : "bg-secondary text-muted-foreground/80"}`}>
                  {cat === "All" ? allProducts.length : allProducts.filter(p => p.category === cat).length}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ── 55% CENTER: PRODUCT GRID ── */}
        <div className="w-[55%] flex flex-col flex-shrink-0 bg-muted">
          
          {/* Quick Action & Search Bar */}
          <div className="p-4 bg-card border-b border-border flex flex-col gap-3 flex-shrink-0 shadow-sm z-10">
            <div className="flex gap-2">
              <button onClick={clearCart} className="flex-1 py-2 bg-secondary hover:bg-accent/80 text-foreground/90 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors"><Plus className="h-3.5 w-3.5"/> New</button>
              <button onClick={() => setViewMode("TABLES")} className="flex-1 py-2 bg-secondary hover:bg-accent/80 text-foreground/90 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors"><ArrowLeftRight className="h-3.5 w-3.5"/> Recall</button>
              <button onClick={() => {}} className="flex-1 py-2 bg-secondary hover:bg-accent/80 text-foreground/90 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors"><User className="h-3.5 w-3.5"/> Cust</button>
              <button onClick={() => router.push("/invoices")} className="flex-1 py-2 bg-secondary hover:bg-accent/80 text-foreground/90 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors"><Receipt className="h-3.5 w-3.5"/> Bills</button>
            </div>
            
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-indigo-500" />
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setViewMode("PRODUCTS"); }}
                placeholder="Search products..."
                className="block w-full pl-11 pr-4 py-3 border-2 border-border rounded-xl bg-muted text-foreground placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-semibold transition-colors"
                autoFocus
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <ScanLine className="h-5 w-5 text-muted-foreground/80" />
              </div>
            </div>
          </div>

          {/* Grid Area */}
          <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
            {viewMode === "ONLINE" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {onlineOrders.length === 0 ? (
                  <div className="col-span-full py-12 flex flex-col items-center justify-center opacity-50">
                    <Smartphone className="h-16 w-16 mb-4 text-muted-foreground" />
                    <p className="font-bold text-lg text-foreground">No pending online orders</p>
                    <p className="text-sm text-muted-foreground">Waiting for Swiggy/Zomato webhooks...</p>
                  </div>
                ) : (
                  onlineOrders.map(order => (
                    <div key={order.id} className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
                      <div className={`p-3 font-bold text-white flex justify-between ${order.source === 'SWIGGY' ? 'bg-orange-500' : 'bg-rose-600'}`}>
                        <span>{order.source}</span>
                        <span>#{order.externalId}</span>
                      </div>
                      <div className="p-4 flex-1">
                        <ul className="space-y-2 mb-4">
                          {order.items.map((i: any) => (
                            <li key={i.id} className="flex justify-between text-sm font-semibold text-foreground">
                              <span>{i.qty}x {i.product.name}</span>
                              <span>₹{(i.price * i.qty).toFixed(2)}</span>
                            </li>
                          ))}
                        </ul>
                        <p className="font-black text-lg text-foreground text-right border-t border-border pt-2 mt-auto">
                          Total: ₹{order.items.reduce((sum: number, i: any) => sum + (i.price * i.qty), 0).toFixed(2)}
                        </p>
                      </div>
                      <div className="flex border-t border-border bg-muted">
                        <button onClick={async () => {
                           await rejectOnlineOrder(order.id);
                           setOnlineOrders(prev => prev.filter(o => o.id !== order.id));
                           toast.success("Order Rejected");
                        }} className="flex-1 p-3 text-rose-500 font-bold hover:bg-rose-500/10">Reject</button>
                        <div className="w-px bg-border"></div>
                        <button onClick={async () => {
                           await acceptOnlineOrder(order.id);
                           setOnlineOrders(prev => prev.filter(o => o.id !== order.id));
                           toast.success("Order Accepted & Sent to KDS");
                           
                           setPrintKotData({
                             tableId: 0,
                             tableName: order.source,
                             orderId: order.id,
                             time: new Date().toLocaleTimeString(),
                             items: order.items.map((i: any) => ({ name: i.product.name, qty: i.qty }))
                           });
                           setTimeout(() => {
                             window.print();
                             setPrintKotData(null);
                           }, 100);
                        }} className="flex-[2] p-3 text-emerald-600 font-bold bg-emerald-500/10 hover:bg-emerald-500/20 flex items-center justify-center gap-2"><Printer className="h-5 w-5"/> Accept & Print KOT</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : viewMode === "PRODUCTS" ? (
              <div className="grid grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredProducts.map((product) => {
                  const inCart = cart.find((i) => i.productId === product.id);
                  const isOutOfStock = product.stock <= 0;
                  return (
                    <motion.button
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2 }}
                      key={product.id}
                      onClick={() => !isOutOfStock && addToCart(product)}
                      disabled={isOutOfStock}
                      className={`relative flex flex-col bg-card border rounded-xl overflow-hidden text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-lg active:scale-95 ${
                        isOutOfStock ? "opacity-50 cursor-not-allowed border-border grayscale" 
                        : inCart ? "border-indigo-500 shadow-md ring-2 ring-indigo-500/50" 
                        : "border-border hover:border-indigo-300 shadow-sm"
                      }`}
                    >
                      {/* Image Placeholder */}
                      <div className="h-24 w-full bg-muted flex items-center justify-center border-b border-border/50 overflow-hidden relative">
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                        ) : product.category?.toLowerCase().includes('food') || product.category?.toLowerCase().includes('burger') || product.category?.toLowerCase().includes('pizza') ? <Pizza className="h-8 w-8 text-muted-foreground/50" /> : 
                         product.category?.toLowerCase().includes('drink') || product.category?.toLowerCase().includes('bev') ? <CupSoda className="h-8 w-8 text-muted-foreground/50" /> :
                         <Package className="h-8 w-8 text-muted-foreground/50" />}
                      </div>
                      
                      <div className="p-3 w-full flex flex-col flex-1">
                        <p className="font-bold text-foreground text-sm leading-tight line-clamp-2 mb-1">{product.name}</p>
                        
                        <div className="mt-auto flex items-end justify-between pt-2">
                          <span className="text-base font-black text-indigo-600">₹{product.price.toFixed(2)}</span>
                          {isOutOfStock ? (
                            <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">OUT</span>
                          ) : (
                            <div className={`p-1 rounded-lg border transition-colors ${inCart ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-muted border-border text-muted-foreground/80'}`}>
                              <Plus className="h-4 w-4" />
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {inCart && (
                        <motion.div 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-2 right-2 h-6 w-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center shadow-md ring-2 ring-white"
                        >
                          {inCart.qty}
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            ) : (
              // Tables View
              <div className="grid grid-cols-3 xl:grid-cols-4 gap-4">
                {tables.map(table => {
                  const isOccupied = table.status === "OCCUPIED";
                  const isActive = activeTableId === table.id;
                  const order = runningOrders.find(o => o.tableId === table.id);

                  return (
                    <button
                      key={table.id}
                      onClick={() => {
                        if (isOccupied && order) { loadOrderIntoCart(order); } 
                        else { setActiveTableId(table.id); setActiveOrderId(null); if (cart.length === 0) setViewMode("PRODUCTS"); }
                      }}
                      className={`relative p-5 rounded-2xl border-2 text-left transition-all hover:-translate-y-1 hover:shadow-md active:scale-95 ${
                        isActive ? "border-indigo-500 bg-indigo-50 shadow-sm" 
                        : isOccupied ? "border-rose-300 bg-rose-50 shadow-sm" 
                        : "border-border bg-card hover:border-indigo-300 shadow-sm"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-4">
                         <span className="text-lg font-bold text-foreground">{table.name}</span>
                         {isOccupied && <span className="h-2.5 w-2.5 rounded-full bg-rose-500 shadow-sm animate-pulse"></span>}
                      </div>
                      
                      {isOccupied ? (
                        <div className="bg-white/60 p-2 rounded-lg border border-rose-100">
                          <p className="text-xs font-bold text-rose-500 mb-0.5">Occupied</p>
                          <p className="text-xs font-semibold text-muted-foreground">{order?.items.reduce((acc: any, i: any) => acc + i.qty, 0)} items running</p>
                        </div>
                      ) : (
                        <div className="bg-muted p-2 rounded-lg border border-border/50">
                          <p className="text-xs font-bold text-emerald-500 mb-0.5">Available</p>
                        </div>
                      )}
                    </button>
                  );
                })}
                <button
                  onClick={() => setShowNewTableModal(true)}
                  className="p-5 rounded-2xl border-2 border-dashed border-border/80 bg-muted hover:bg-accent text-muted-foreground transition-all flex flex-col items-center justify-center gap-2"
                >
                  <Plus className="h-6 w-6 text-muted-foreground/80" />
                  <span className="font-semibold text-sm">Add Table</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── 30% RIGHT: CHECKOUT PANEL ── */}
        <div className="w-[30%] bg-card border-l border-border flex flex-col z-20 flex-shrink-0 relative">
          
          {/* Customer Selection Sticky Top */}
          <div className="p-4 border-b border-border/50 bg-muted flex-shrink-0">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-4 w-4 text-muted-foreground/80" />
              </div>
              <input
                type="text"
                value={customerName}
                onChange={(e) => { setCustomerName(e.target.value); setShowCustomerDropdown(true); }}
                onFocus={() => setShowCustomerDropdown(true)}
                onBlur={() => setTimeout(() => setShowCustomerDropdown(false), 200)}
                placeholder="Walk-in Customer"
                className="w-full pl-9 pr-3 py-2 bg-card border border-border rounded-xl text-sm font-semibold text-foreground placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-sm transition-all"
              />
              {showCustomerDropdown && customerName && (
                <div className="absolute z-50 top-[calc(100%+4px)] left-0 right-0 bg-card border border-border rounded-xl shadow-xl max-h-48 overflow-y-auto">
                  {allCustomers.filter((c) => c.name.toLowerCase().includes(customerName.toLowerCase())).map((c) => (
                      <button
                        key={c.id}
                        className="w-full text-left px-4 py-3 hover:bg-muted/80 border-b border-border/50 text-sm font-semibold text-foreground"
                        onClick={() => { setCustomerName(c.name); setCustomerPhone(c.phone || ""); setShowCustomerDropdown(false); }}
                      >
                        {c.name} {c.phone && <span className="text-muted-foreground/80 font-medium ml-2">{c.phone}</span>}
                      </button>
                  ))}
                  {allCustomers.filter((c) => c.name.toLowerCase().includes(customerName.toLowerCase())).length === 0 && (
                     <div className="px-4 py-3 text-sm text-muted-foreground font-medium italic">
                        New customer will be recorded
                     </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin">
            {cart.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="h-full flex flex-col items-center justify-center text-muted-foreground/50"
              >
                <ShoppingCart className="h-12 w-12 mb-4 opacity-50 text-muted-foreground/50" />
                <p className="text-base font-semibold text-muted-foreground/80">Cart is empty</p>
                <p className="text-xs mt-1 text-center px-8 text-muted-foreground/80">Scan items or click products to add them to the bill.</p>
              </motion.div>
            ) : (
              <AnimatePresence mode="popLayout">
                {cart.map((item) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9, x: -20 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    key={item.productId} 
                    className="bg-card border border-border/50 shadow-sm rounded-xl p-3 flex flex-col group transition-colors hover:border-border hover:shadow-md"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-bold text-foreground text-sm leading-tight pr-2">{item.name}</p>
                      <button onClick={() => removeFromCart(item.productId)} className="text-muted-foreground/80 hover:text-rose-500 bg-muted hover:bg-rose-50 p-1 rounded transition-colors"><X className="h-3.5 w-3.5" /></button>
                    </div>
                    
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-muted-foreground font-semibold text-[12px]">₹{item.price.toFixed(2)}</span>
                      
                      <div className="flex items-center bg-muted border border-border rounded-lg p-0.5">
                        <button onClick={() => updateQty(item.productId, -1)} className="p-1 text-muted-foreground hover:text-foreground bg-card rounded shadow-sm border border-border/50 transition-colors"><Minus className="h-3 w-3" /></button>
                        <span className="font-bold text-foreground w-8 text-center text-[13px]">{item.qty}</span>
                        <button onClick={() => updateQty(item.productId, 1)} className="p-1 text-muted-foreground hover:text-foreground bg-card rounded shadow-sm border border-border/50 transition-colors"><Plus className="h-3 w-3" /></button>
                      </div>
                      
                      <span className="font-bold text-foreground text-[14px]">₹{(item.price * item.qty).toFixed(2)}</span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>

          {/* Checkout Area */}
          <div className="bg-muted border-t border-border flex-shrink-0 pb-0 rounded-br-2xl">
            
            {/* Breakdowns */}
            <div className="px-5 py-3 space-y-1.5 border-b border-border bg-card">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-muted-foreground">Subtotal</span>
                <span className="font-semibold text-foreground">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-muted-foreground">Tax</span>
                <span className="font-semibold text-foreground">+₹{gstAmount.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-sm pt-1 border-t border-border/50">
                <span className="font-semibold text-muted-foreground">Discount (₹)</span>
                <input
                  type="number"
                  min="0"
                  value={discountAmount || ""}
                  onChange={(e) => setDiscountAmount(Number(e.target.value))}
                  placeholder="0.00"
                  className="w-20 text-right border border-border rounded px-2 py-0.5 font-semibold text-foreground focus:outline-none focus:border-indigo-500 bg-muted focus:bg-white"
                />
              </div>
            </div>

            {/* Total */}
            <div className="px-5 py-4 bg-muted flex items-end justify-between border-b border-border">
              <span className="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-1">TOTAL</span>
              <span className="text-3xl font-black text-indigo-600 tracking-tight leading-none">₹{grandTotal.toFixed(2)}</span>
            </div>

            {/* Action Buttons */}
            <div className="p-4 bg-card rounded-br-2xl flex gap-2">
              <button
                onClick={handleParkOrder}
                disabled={cart.length === 0 || isCheckingOut}
                className="flex-[1] py-4 rounded-xl bg-orange-100 hover:bg-orange-200 text-orange-700 font-bold text-lg tracking-wide shadow-sm hover:shadow-md transition-all active:scale-95 disabled:opacity-40"
              >
                KOT
              </button>
              <button
                onClick={() => setCheckoutModalOpen(true)}
                disabled={cart.length === 0 || isCheckingOut}
                className="flex-[2] py-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xl tracking-wide shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-40 flex items-center justify-center gap-3"
              >
                Check Out
              </button>
            </div>
            
          </div>
        </div>

      </div>

      {/* New Table Modal */}
      {showNewTableModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-card rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border/50 flex items-center justify-between">
              <h2 className="font-bold text-foreground text-lg">Add New Table</h2>
              <button onClick={() => setShowNewTableModal(false)} className="p-1.5 text-muted-foreground/80 hover:bg-accent rounded-xl transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Table Name or Number</label>
                <input 
                  autoFocus
                  value={newTableName} 
                  onChange={(e) => setNewTableName(e.target.value)}
                  className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm font-semibold text-foreground outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all" 
                  placeholder="e.g. Table 1, T2, Balcony A" 
                />
              </div>
              <div className="flex justify-end gap-3">
                <button onClick={() => setShowNewTableModal(false)} className="px-5 py-2.5 rounded-xl font-bold text-muted-foreground bg-secondary hover:bg-accent/80 transition-colors">
                  Cancel
                </button>
                <button 
                  onClick={async () => {
                    if (!newTableName) return;
                    startFetching(async () => {
                      const res = await createTable(newTableName);
                      if (res.error) toast.error(res.error);
                      else {
                        toast.success("Table created successfully!");
                        setNewTableName("");
                        setShowNewTableModal(false);
                        await loadTablesAndOrders();
                      }
                    });
                  }}
                  disabled={isFetching} 
                  className="px-5 py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md transition-all"
                >
                  {isFetching ? "Saving..." : "Save Table"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {checkoutModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-card rounded-2xl shadow-xl w-full max-w-2xl flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-border/50 flex items-center justify-between bg-muted">
              <h2 className="font-bold text-foreground text-xl">Settle Payment</h2>
              <button onClick={() => setCheckoutModalOpen(false)} className="p-1.5 text-muted-foreground/80 hover:bg-accent/80 rounded-xl transition-colors">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="flex h-full">
              {/* Left Side: Details & Config */}
              <div className="w-1/2 p-6 border-r border-border/50 flex flex-col gap-6">
                <div>
                  <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">To Pay</div>
                  <div className="text-4xl font-black text-indigo-600">₹{grandTotal.toFixed(2)}</div>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-2 hover:bg-muted/80 rounded-lg cursor-pointer">
                    <input type="checkbox" className="w-5 h-5 rounded border-border/80 text-indigo-600 focus:ring-indigo-500" />
                    <span className="font-medium text-foreground/90">Settle without bill print</span>
                  </label>
                  <label className="flex items-center gap-3 p-2 hover:bg-muted/80 rounded-lg cursor-pointer">
                    <input type="checkbox" className="w-5 h-5 rounded border-border/80 text-indigo-600 focus:ring-indigo-500" />
                    <span className="font-medium text-foreground/90">Print Duplicate Bill</span>
                  </label>
                  <label className="flex items-center gap-3 p-2 hover:bg-muted/80 rounded-lg cursor-pointer">
                    <input type="checkbox" className="w-5 h-5 rounded border-border/80 text-indigo-600 focus:ring-indigo-500" />
                    <span className="font-medium text-foreground/90">Complimentary Bill</span>
                  </label>
                </div>
              </div>

              {/* Right Side: Modes */}
              <div className="w-1/2 p-6 flex flex-col gap-6 bg-muted">
                <div>
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                    <span className="w-4 h-px bg-slate-300"></span> Other Modes <span className="flex-1 h-px bg-slate-300"></span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {paymentModes.map(mode => (
                      <button 
                        key={mode.method}
                        onClick={() => setSelectedPaymentMode(mode.method)}
                        className={`p-3 rounded-xl border-2 font-bold flex flex-col items-center justify-center gap-2 transition-all ${
                          selectedPaymentMode === mode.method 
                          ? "border-indigo-500 bg-indigo-50 text-indigo-700" 
                          : "border-border bg-card text-muted-foreground hover:border-indigo-300"
                        }`}
                      >
                        <mode.icon className="h-5 w-5" />
                        {mode.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                    <span className="w-4 h-px bg-slate-300"></span> Order Modes <span className="flex-1 h-px bg-slate-300"></span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {["DINE_IN", "SWIGGY", "ZOMATO", "TAKEAWAY"].map(mode => (
                      <button
                        key={mode}
                        onClick={() => setSelectedOrderMode(mode)}
                        className={`p-2 rounded-xl border-2 font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all ${
                          selectedOrderMode === mode
                          ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                          : "border-border bg-card text-muted-foreground hover:border-emerald-300"
                        }`}
                      >
                        {mode === "SWIGGY" && <img src="https://cdn.iconscout.com/icon/free/png-256/free-swiggy-1613371-1369418.png" className="w-6 h-6 object-contain" alt="Swiggy"/>}
                        {mode === "ZOMATO" && <img src="https://b.zmtcdn.com/images/logo/zomato_logo_2017.png" className="w-6 h-6 object-contain" alt="Zomato"/>}
                        {mode === "DINE_IN" && <User className="w-6 h-6" />}
                        {mode === "TAKEAWAY" && <Package className="w-6 h-6" />}
                        <span className="truncate w-full text-center">{mode}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-card border-t border-border/50 flex gap-3">
              <button 
                onClick={() => handleCheckout(selectedPaymentMode)}
                disabled={isCheckingOut}
                className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
              >
                <Printer className="h-5 w-5" />
                Print Bill
              </button>
              <button 
                onClick={() => handleCheckout(selectedPaymentMode)}
                disabled={isCheckingOut}
                className="flex-[2] py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
              >
                Settle Bill
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
}
