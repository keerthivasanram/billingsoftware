"use client";

import { useState, useTransition, useEffect } from "react";
import { Users, CalendarCheck, IndianRupee, Plus, Save, Clock, ChevronLeft, ChevronRight, Check, X } from "lucide-react";
import { toast } from "sonner";
import { createEmployee, updateEmployee, markAttendance, getAttendancesByDate, paySalary } from "@/app/actions/staff";

type Employee = {
  id: number;
  name: string;
  role: string;
  dailyWage: number;
  phone: string | null;
  status: string;
  totalEarned: number;
  totalPaid: number;
  pendingBalance: number;
};

export function StaffClient({ initialEmployees }: { initialEmployees: Employee[] }) {
  const [activeTab, setActiveTab] = useState<"ROSTER" | "ATTENDANCE" | "SALARY">("ROSTER");
  const [employees, setEmployees] = useState(initialEmployees);
  const [isPending, startTransition] = useTransition();

  // Roster state
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ name: "", role: "Staff", phone: "", dailyWage: 0 });

  // Attendance state
  const [attDate, setAttDate] = useState(new Date());
  const [attendances, setAttendances] = useState<any[]>([]);

  // Salary state
  const [payoutModal, setPayoutModal] = useState<{ open: boolean; emp: Employee | null; amount: number; month: string }>({
    open: false, emp: null, amount: 0, month: new Date().toISOString().slice(0, 7)
  });

  useEffect(() => {
    if (activeTab === "ATTENDANCE") {
      loadAttendances(attDate);
    }
  }, [activeTab, attDate]);

  const loadAttendances = async (date: Date) => {
    const data = await getAttendancesByDate(date);
    setAttendances(data);
  };

  const handleSaveEmployee = () => {
    startTransition(async () => {
      const res = await createEmployee({ ...formData, dailyWage: Number(formData.dailyWage) });
      if (res.error) toast.error(res.error);
      else {
        toast.success("Employee added");
        setIsAdding(false);
        setFormData({ name: "", role: "Staff", phone: "", dailyWage: 0 });
        window.location.reload(); // simple reload to get new summary
      }
    });
  };

  const handleMarkAtt = (empId: number, status: "PRESENT" | "HALF_DAY" | "ABSENT") => {
    startTransition(async () => {
      const res = await markAttendance(empId, attDate, status);
      if (res.error) toast.error(res.error);
      else {
        toast.success("Attendance marked");
        loadAttendances(attDate);
      }
    });
  };

  const handlePayout = () => {
    if (!payoutModal.emp) return;
    startTransition(async () => {
      const res = await paySalary(payoutModal.emp!.id, Number(payoutModal.amount), payoutModal.month, "Salary");
      if (res.error) toast.error(res.error);
      else {
        toast.success("Salary Paid & Expense Logged");
        setPayoutModal({ ...payoutModal, open: false });
        window.location.reload();
      }
    });
  };

  const changeDate = (days: number) => {
    const d = new Date(attDate);
    d.setDate(d.getDate() + days);
    setAttDate(d);
  };

  const tabs = [
    { id: "ROSTER", label: "Employee Roster", icon: Users },
    { id: "ATTENDANCE", label: "Daily Attendance", icon: CalendarCheck },
    { id: "SALARY", label: "Salary & Payouts", icon: IndianRupee },
  ] as const;

  return (
    <div className="animate-fade-in space-y-6 pb-8">
      {/* Header */}
      <div className="pb-6 border-b border-border flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center">
              <Users className="h-4 w-4 text-indigo-500" />
            </div>
            <h1 className="page-title text-foreground">Staff Management</h1>
          </div>
          <p className="page-subtitle ml-11 text-muted-foreground">Manage employees, track attendance, and process payroll</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-muted p-1 rounded-xl w-fit">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === t.id ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden min-h-[500px]">
        {/* ROSTER TAB */}
        {activeTab === "ROSTER" && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-foreground">Active Employees</h2>
              <button onClick={() => setIsAdding(!isAdding)} className="btn btn-primary flex items-center gap-2">
                <Plus className="h-4 w-4" /> Add Employee
              </button>
            </div>

            {isAdding && (
              <div className="mb-6 p-4 border border-border rounded-xl bg-muted/30 grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Name</label>
                  <input type="text" className="input w-full" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Role</label>
                  <input type="text" className="input w-full" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Phone</label>
                  <input type="text" className="input w-full" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Daily Wage (₹)</label>
                  <input type="number" className="input w-full" value={formData.dailyWage || ""} onChange={e => setFormData({...formData, dailyWage: Number(e.target.value)})} />
                </div>
                <div className="flex gap-2">
                  <button onClick={handleSaveEmployee} disabled={isPending} className="btn bg-emerald-600 hover:bg-emerald-700 text-white w-full"><Save className="h-4 w-4 mr-2" /> Save</button>
                  <button onClick={() => setIsAdding(false)} className="btn btn-secondary px-3"><X className="h-4 w-4" /></button>
                </div>
              </div>
            )}

            <table className="w-full text-left border-collapse">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Name</th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Role</th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Phone</th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase text-right">Daily Wage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {employees.map(emp => (
                  <tr key={emp.id} className="hover:bg-muted/50">
                    <td className="px-4 py-3 font-semibold text-foreground">{emp.name}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{emp.role}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{emp.phone || "-"}</td>
                    <td className="px-4 py-3 text-right font-bold text-foreground">₹{emp.dailyWage}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ATTENDANCE TAB */}
        {activeTab === "ATTENDANCE" && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6 bg-muted p-2 rounded-xl border border-border">
              <button onClick={() => changeDate(-1)} className="btn btn-secondary px-3"><ChevronLeft className="h-4 w-4" /></button>
              <div className="flex items-center gap-2 font-bold text-foreground">
                <Clock className="h-4 w-4 text-primary" />
                {attDate.toDateString()}
              </div>
              <button onClick={() => changeDate(1)} className="btn btn-secondary px-3"><ChevronRight className="h-4 w-4" /></button>
            </div>

            <table className="w-full text-left border-collapse">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Employee</th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase text-center">Status</th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase text-right">Calculated Wage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {employees.filter(e => e.status === "ACTIVE").map(emp => {
                  const att = attendances.find(a => a.employeeId === emp.id);
                  return (
                    <tr key={emp.id} className="hover:bg-muted/50">
                      <td className="px-4 py-3 font-semibold text-foreground">{emp.name}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleMarkAtt(emp.id, "PRESENT")}
                            className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${att?.status === "PRESENT" ? "bg-emerald-500 text-white shadow-sm ring-2 ring-emerald-500/20" : "bg-muted text-muted-foreground hover:bg-emerald-500/10 hover:text-emerald-500"}`}
                          >
                            P
                          </button>
                          <button
                            onClick={() => handleMarkAtt(emp.id, "HALF_DAY")}
                            className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${att?.status === "HALF_DAY" ? "bg-amber-500 text-white shadow-sm ring-2 ring-amber-500/20" : "bg-muted text-muted-foreground hover:bg-amber-500/10 hover:text-amber-500"}`}
                          >
                            H
                          </button>
                          <button
                            onClick={() => handleMarkAtt(emp.id, "ABSENT")}
                            className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${att?.status === "ABSENT" ? "bg-rose-500 text-white shadow-sm ring-2 ring-rose-500/20" : "bg-muted text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500"}`}
                          >
                            A
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-foreground">
                        {att ? `₹${att.calculatedWage}` : "-"}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* SALARY TAB */}
        {activeTab === "SALARY" && (
          <div className="p-6">
            <table className="w-full text-left border-collapse">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Employee</th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase text-right">Total Earned</th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase text-right">Total Paid</th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase text-right">Pending Balance</th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {employees.map(emp => (
                  <tr key={emp.id} className="hover:bg-muted/50">
                    <td className="px-4 py-3 font-semibold text-foreground">{emp.name}</td>
                    <td className="px-4 py-3 text-right font-semibold text-emerald-500">₹{emp.totalEarned}</td>
                    <td className="px-4 py-3 text-right font-semibold text-muted-foreground">₹{emp.totalPaid}</td>
                    <td className="px-4 py-3 text-right font-bold text-rose-500">₹{emp.pendingBalance}</td>
                    <td className="px-4 py-3 text-right">
                      {emp.pendingBalance > 0 && (
                        <button
                          onClick={() => setPayoutModal({ open: true, emp, amount: emp.pendingBalance, month: new Date().toISOString().slice(0, 7) })}
                          className="btn btn-secondary text-xs px-3 py-1.5"
                        >
                          Pay Salary
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Payout Modal */}
            {payoutModal.open && payoutModal.emp && (
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-card w-full max-w-sm rounded-2xl shadow-xl overflow-hidden animate-scale-in">
                  <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-muted/30">
                    <h3 className="font-bold text-lg text-foreground">Pay Salary</h3>
                    <button onClick={() => setPayoutModal({...payoutModal, open: false})} className="p-2 hover:bg-muted rounded-xl transition-colors"><X className="h-5 w-5 text-muted-foreground" /></button>
                  </div>
                  <div className="p-6 space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Employee</p>
                      <p className="font-bold text-foreground">{payoutModal.emp.name}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1">Amount to Pay</label>
                      <input type="number" className="input w-full" value={payoutModal.amount} onChange={e => setPayoutModal({...payoutModal, amount: Number(e.target.value)})} />
                    </div>
                    <button disabled={isPending} onClick={handlePayout} className="btn bg-indigo-600 hover:bg-indigo-700 text-white w-full">Confirm Payout</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
