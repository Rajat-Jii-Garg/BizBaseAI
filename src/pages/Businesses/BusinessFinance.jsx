import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSign, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Plus, Loader2, Receipt, Wallet } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBusinessContext } from '@/contexts/BusinessContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const BusinessFinance = () => {
  const { currentBusiness } = useBusinessContext();
  const businessId = currentBusiness?.id;
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTx, setNewTx] = useState({ type: 'income', amount: '', description: '', category: '', date: new Date().toISOString().split('T')[0], payment_method: '' });

  useEffect(() => { if (businessId) fetchTransactions(); }, [businessId]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('business_transactions').select('*').eq('business_id', businessId).order('date', { ascending: false });
      if (error) throw error;
      setTransactions(data || []);
    } catch (error) { console.error('Error fetching transactions:', error); } finally { setLoading(false); }
  };

  const handleAddTransaction = async () => {
    if (!newTx.amount || !newTx.description) { toast.error('Amount and description are required'); return; }
    try {
      const { error } = await supabase.from('business_transactions').insert({
        business_id: businessId, type: newTx.type, amount: parseFloat(newTx.amount),
        description: newTx.description, category: newTx.category || null,
        date: newTx.date, payment_method: newTx.payment_method || null
      });
      if (error) throw error;
      toast.success('Transaction added');
      setIsDialogOpen(false);
      setNewTx({ type: 'income', amount: '', description: '', category: '', date: new Date().toISOString().split('T')[0], payment_method: '' });
      fetchTransactions();
    } catch (error) { console.error('Error:', error); toast.error('Failed to add transaction'); }
  };

  const handleDelete = async (id) => {
    try {
      const { error } = await supabase.from('business_transactions').delete().eq('id', id);
      if (error) throw error;
      toast.success('Transaction deleted');
      setTransactions(prev => prev.filter(t => t.id !== id));
    } catch (error) { toast.error('Failed to delete'); }
  };

  const stats = {
    totalIncome: transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + parseFloat(t.amount), 0),
    totalExpense: transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + parseFloat(t.amount), 0),
  };
  stats.balance = stats.totalIncome - stats.totalExpense;

  return (
    <div className="p-3 md:p-5 space-y-4 text-[13px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold text-foreground">Finance</h1>
          <p className="text-xs text-muted-foreground">Track income, expenses and financial health</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild><Button size="sm" className="gap-1.5 text-xs h-8"><Plus className="w-3.5 h-3.5" />Add Transaction</Button></DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle className="text-sm">Add Transaction</DialogTitle></DialogHeader>
            <div className="space-y-3 mt-3">
              <div><Label className="text-xs">Type</Label><Select value={newTx.type} onValueChange={(v) => setNewTx({ ...newTx, type: v })}><SelectTrigger className="h-8 text-xs mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="income">Income</SelectItem><SelectItem value="expense">Expense</SelectItem></SelectContent></Select></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Amount (₹) *</Label><Input type="number" value={newTx.amount} onChange={(e) => setNewTx({ ...newTx, amount: e.target.value })} placeholder="10000" className="h-8 text-xs mt-1" /></div>
                <div><Label className="text-xs">Date</Label><Input type="date" value={newTx.date} onChange={(e) => setNewTx({ ...newTx, date: e.target.value })} className="h-8 text-xs mt-1" /></div>
              </div>
              <div><Label className="text-xs">Description *</Label><Input value={newTx.description} onChange={(e) => setNewTx({ ...newTx, description: e.target.value })} placeholder="Payment for services" className="h-8 text-xs mt-1" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Category</Label><Input value={newTx.category} onChange={(e) => setNewTx({ ...newTx, category: e.target.value })} placeholder="Sales, Marketing..." className="h-8 text-xs mt-1" /></div>
                <div><Label className="text-xs">Payment Method</Label><Select value={newTx.payment_method} onValueChange={(v) => setNewTx({ ...newTx, payment_method: v })}><SelectTrigger className="h-8 text-xs mt-1"><SelectValue placeholder="Select..." /></SelectTrigger><SelectContent><SelectItem value="cash">Cash</SelectItem><SelectItem value="upi">UPI</SelectItem><SelectItem value="bank_transfer">Bank Transfer</SelectItem><SelectItem value="card">Card</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent></Select></div>
              </div>
              <Button onClick={handleAddTransaction} className="w-full h-8 text-xs">Add Transaction</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {[
          { label: 'Total Income', value: `₹${stats.totalIncome.toLocaleString()}`, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950/30', icon: TrendingUp },
          { label: 'Total Expenses', value: `₹${stats.totalExpense.toLocaleString()}`, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-950/30', icon: TrendingDown },
          { label: 'Net Balance', value: `₹${stats.balance.toLocaleString()}`, color: stats.balance >= 0 ? 'text-green-600' : 'text-red-600', bg: stats.balance >= 0 ? 'bg-green-50 dark:bg-green-950/30' : 'bg-red-50 dark:bg-red-950/30', icon: Wallet },
        ].map((s, i) => (
          <Card key={i}><CardContent className="p-4 flex items-center justify-between">
            <div><p className="text-[10px] text-muted-foreground mb-0.5">{s.label}</p><p className={`text-xl font-bold ${s.color}`}>{s.value}</p></div>
            <div className={`p-2 rounded-xl ${s.bg}`}><s.icon className={`w-5 h-5 ${s.color}`} /></div>
          </CardContent></Card>
        ))}
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="h-8">
          <TabsTrigger value="all" className="text-xs h-7">All ({transactions.length})</TabsTrigger>
          <TabsTrigger value="income" className="text-xs h-7">Income ({transactions.filter(t => t.type === 'income').length})</TabsTrigger>
          <TabsTrigger value="expenses" className="text-xs h-7">Expenses ({transactions.filter(t => t.type === 'expense').length})</TabsTrigger>
        </TabsList>
        <TabsContent value="all"><TxList transactions={transactions} loading={loading} onDelete={handleDelete} /></TabsContent>
        <TabsContent value="income"><TxList transactions={transactions.filter(t => t.type === 'income')} loading={loading} onDelete={handleDelete} /></TabsContent>
        <TabsContent value="expenses"><TxList transactions={transactions.filter(t => t.type === 'expense')} loading={loading} onDelete={handleDelete} /></TabsContent>
      </Tabs>
    </div>
  );
};

const TxList = ({ transactions, loading, onDelete }) => {
  if (loading) return <Card><CardContent className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary" /></CardContent></Card>;
  if (transactions.length === 0) return <Card><CardContent className="text-center py-10"><Receipt className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" /><p className="text-sm font-medium">No transactions yet</p></CardContent></Card>;

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 font-medium text-[10px] text-muted-foreground uppercase">Date</th>
                <th className="text-left p-3 font-medium text-[10px] text-muted-foreground uppercase">Description</th>
                <th className="text-left p-3 font-medium text-[10px] text-muted-foreground uppercase hidden md:table-cell">Category</th>
                <th className="text-left p-3 font-medium text-[10px] text-muted-foreground uppercase hidden sm:table-cell">Payment</th>
                <th className="text-right p-3 font-medium text-[10px] text-muted-foreground uppercase">Amount</th>
                <th className="text-right p-3 font-medium text-[10px] text-muted-foreground uppercase w-10"></th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id} className="border-t border-border hover:bg-muted/30">
                  <td className="p-3 text-xs text-muted-foreground whitespace-nowrap">{new Date(tx.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                  <td className="p-3 text-xs font-medium">{tx.description}</td>
                  <td className="p-3 hidden md:table-cell">{tx.category && <Badge variant="outline" className="text-[10px]">{tx.category}</Badge>}</td>
                  <td className="p-3 text-xs text-muted-foreground capitalize hidden sm:table-cell">{tx.payment_method?.replace('_', ' ') || '-'}</td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-0.5">
                      {tx.type === 'income' ? <><ArrowUpRight className="w-3 h-3 text-green-600" /><span className="text-xs font-semibold text-green-600">+₹{parseFloat(tx.amount).toLocaleString()}</span></> : <><ArrowDownRight className="w-3 h-3 text-red-600" /><span className="text-xs font-semibold text-red-600">-₹{parseFloat(tx.amount).toLocaleString()}</span></>}
                    </div>
                  </td>
                  <td className="p-3 text-right">
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive" onClick={() => onDelete(tx.id)}>×</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default BusinessFinance;
