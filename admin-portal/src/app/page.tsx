import { prisma } from "@/lib/prisma";
import { createClient, generateLicense, revokeLicense } from "./actions";
import { approveLead } from "./actions/leads";
import { sendNotification } from "./actions/notifications";
import { Shield, Key, Users, CheckCircle, XCircle, BellRing, Phone, Mail } from "lucide-react";

export default async function AdminDashboard() {
  const clients = await prisma.client.findMany({
    include: { licenses: true },
    orderBy: { createdAt: "desc" }
  });

  const leads = await prisma.lead.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "desc" }
  });

  const activeLicenses = clients.flatMap(c => c.licenses).filter(l => l.status === "ACTIVE").length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
              <Shield className="h-8 w-8 text-indigo-600" />
              Super Admin Portal
            </h1>
            <p className="text-slate-500 mt-1">Manage software licenses and clients remotely.</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-white px-6 py-3 rounded-xl shadow-sm border border-slate-200 text-center">
              <p className="text-sm font-semibold text-slate-500">Pending Leads</p>
              <p className="text-2xl font-bold text-amber-600">{leads.length}</p>
            </div>
            <div className="bg-white px-6 py-3 rounded-xl shadow-sm border border-slate-200 text-center">
              <p className="text-sm font-semibold text-slate-500">Total Clients</p>
              <p className="text-2xl font-bold text-slate-900">{clients.length}</p>
            </div>
            <div className="bg-white px-6 py-3 rounded-xl shadow-sm border border-slate-200 text-center">
              <p className="text-sm font-semibold text-slate-500">Active Licenses</p>
              <p className="text-2xl font-bold text-emerald-600">{activeLicenses}</p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Forms */}
          <div className="space-y-6">
            
            {/* Create Client Form */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <Users className="h-5 w-5 text-indigo-500" />
                Add New Client
              </h2>
              <form action={async (formData) => { "use server"; await createClient(formData); }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Store / Hotel Name</label>
                  <input name="name" required className="w-full px-3 py-2 border rounded-lg" placeholder="e.g. Grand Hotel" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Contact Email</label>
                  <input name="email" type="email" className="w-full px-3 py-2 border rounded-lg" placeholder="admin@grandhotel.com" />
                </div>
                <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition">
                  Create Client
                </button>
              </form>
            </div>

            {/* Generate License Form */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <Key className="h-5 w-5 text-emerald-500" />
                Generate License Key
              </h2>
              <form action={async (formData) => { "use server"; await generateLicense(formData); }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Select Client</label>
                  <select name="clientId" required className="w-full px-3 py-2 border rounded-lg bg-white">
                    <option value="">-- Choose Client --</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Duration</label>
                  <select name="duration" required className="w-full px-3 py-2 border rounded-lg bg-white">
                    <option value="1">1 Month (Trial)</option>
                    <option value="6">6 Months</option>
                    <option value="12">1 Year</option>
                    <option value="120">10 Years (Lifetime)</option>
                  </select>
                </div>
                <button type="submit" className="w-full bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 transition">
                  Generate Secure Key
                </button>
              </form>
            </div>

            {/* Notification Engine Form */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <Mail className="h-5 w-5 text-blue-500" />
                Notification Engine
              </h2>
              <form action={async (formData) => { "use server"; await sendNotification(formData); }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Audience</label>
                  <select name="audience" required className="w-full px-3 py-2 border rounded-lg bg-white">
                    <option value="all_clients">All Clients</option>
                    <option value="active_licenses">Clients with Active Licenses</option>
                    <option value="leads">All Pending Leads</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                  <input name="subject" required className="w-full px-3 py-2 border rounded-lg" placeholder="Important Update" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
                  <textarea name="message" required className="w-full px-3 py-2 border rounded-lg h-24 resize-none" placeholder="Write your message here..."></textarea>
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">
                  Send Emails
                </button>
              </form>
            </div>

          </div>

          {/* Right Column: Client & License List */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Pending Leads */}
            {leads.length > 0 && (
              <div className="bg-amber-50 rounded-2xl shadow-sm border border-amber-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-amber-200 bg-amber-100/50 flex items-center gap-2">
                  <BellRing className="h-5 w-5 text-amber-600" />
                  <h2 className="text-lg font-semibold text-amber-900">New Registration Requests</h2>
                </div>
                <div className="divide-y divide-amber-100">
                  {leads.map(lead => (
                    <div key={lead.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="font-bold text-amber-950 text-lg">{lead.businessName}</h3>
                        <p className="text-sm text-amber-800 flex items-center gap-1 mt-1">
                          <Users className="h-3.5 w-3.5" /> {lead.name} &bull; {lead.email || "No email"}
                        </p>
                        <p className="text-sm text-amber-800 flex items-center gap-1 font-medium mt-1">
                          <Phone className="h-3.5 w-3.5" /> {lead.phone}
                        </p>
                      </div>
                      <form action={async () => {
                        "use server";
                        await approveLead(lead.id);
                      }}>
                        <button type="submit" className="bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-700 transition shadow-sm whitespace-nowrap">
                          Approve & Create Client
                        </button>
                      </form>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Clients List */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                <h2 className="text-lg font-semibold text-slate-800">Client Roster & Licenses</h2>
              </div>
              <div className="divide-y divide-slate-100">
                {clients.length === 0 ? (
                  <div className="p-8 text-center text-slate-500">No clients found. Add one to generate a license.</div>
                ) : (
                  clients.map(client => (
                    <div key={client.id} className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-bold text-slate-900 text-lg">{client.name}</h3>
                          <p className="text-sm text-slate-500">{client.email || "No email provided"}</p>
                        </div>
                        <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">
                          {client.licenses.length} License(s)
                        </span>
                      </div>
                      
                      {/* Licenses Table */}
                      {client.licenses.length > 0 && (
                        <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden mt-3">
                          <table className="w-full text-left text-sm">
                            <thead className="bg-slate-100/50 text-slate-500">
                              <tr>
                                <th className="px-4 py-2 font-medium">License Key</th>
                                <th className="px-4 py-2 font-medium">Status</th>
                                <th className="px-4 py-2 font-medium">Expires</th>
                                <th className="px-4 py-2 font-medium text-right">Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {client.licenses.map(license => (
                                <tr key={license.id}>
                                  <td className="px-4 py-3 font-mono text-indigo-600 font-medium">
                                    {license.key}
                                  </td>
                                  <td className="px-4 py-3">
                                    {license.status === "ACTIVE" ? (
                                      <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-xs font-semibold w-max">
                                        <CheckCircle className="h-3 w-3" /> ACTIVE
                                      </span>
                                    ) : (
                                      <span className="flex items-center gap-1 text-rose-600 bg-rose-50 px-2 py-0.5 rounded text-xs font-semibold w-max">
                                        <XCircle className="h-3 w-3" /> {license.status}
                                      </span>
                                    )}
                                  </td>
                                  <td className="px-4 py-3 text-slate-600">
                                    {new Date(license.expiresAt).toLocaleDateString()}
                                  </td>
                                  <td className="px-4 py-3 text-right">
                                    {license.status === "ACTIVE" && (
                                      <form action={async (formData) => { "use server"; await revokeLicense(formData); }}>
                                        <input type="hidden" name="licenseId" value={license.id} />
                                        <button type="submit" className="text-xs text-rose-600 hover:text-rose-800 font-medium bg-rose-50 hover:bg-rose-100 px-2 py-1 rounded transition">
                                          Revoke
                                        </button>
                                      </form>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
