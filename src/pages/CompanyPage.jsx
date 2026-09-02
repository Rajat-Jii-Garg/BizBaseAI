import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Globe, MapPin, Mail, Phone, Package, Share2, Building2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import SEOHead from '@/components/SEOHead';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { CANONICAL_SITE_URL } from '@/lib/siteUrl';
import { formatMoney } from '@/lib/money';
import { toast } from 'sonner';

const CompanyPage = () => {
  const { username } = useParams();
  const [business, setBusiness] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .ilike('username', username)
        .eq('status', 'active')
        .maybeSingle();

      if (!active) return;
      if (error) console.error('Error loading business:', error);

      if (data) {
        setBusiness(data);
        const { data: catalog } = await supabase
          .from('business_products')
          .select('*')
          .eq('business_id', data.id)
          .eq('is_active', true)
          .order('created_at', { ascending: false });
        if (active) setItems(catalog || []);
      }
      if (active) setLoading(false);
    };
    load();
    return () => { active = false; };
  }, [username]);

  const shareUrl = `${CANONICAL_SITE_URL}/company/${username}`;

  const handleShare = async () => {
    const payload = { title: business?.name, text: business?.description || '', url: shareUrl };
    try {
      if (navigator.share) await navigator.share(payload);
      else { await navigator.clipboard.writeText(shareUrl); toast.success('Link copied'); }
    } catch { /* user dismissed */ }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-7 h-7 animate-spin text-primary" />
      </div>
    );
  }

  if (!business || business.is_public === false) {
    return (
      <div className="min-h-screen bg-background">
        <SEOHead title="Business not found" path={`/company/${username}`} noIndex />
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-24 text-center">
          <Building2 className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-foreground mb-2">This business page isn't available</h1>
          <p className="text-sm text-muted-foreground mb-5">It may be private or no longer active on BizBase.</p>
          <Button asChild size="sm"><Link to="/">Back to BizBase</Link></Button>
        </div>
        <Footer />
      </div>
    );
  }

  const location = [business.city, business.country].filter(Boolean).join(', ');
  const description = business.description
    || `${business.name} on BizBase — ${business.industry || business.category || 'business'}${location ? ` based in ${location}` : ''}. See products, services and contact details.`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: business.name,
    url: shareUrl,
    description,
    ...(business.logo_url ? { logo: business.logo_url } : {}),
    ...(business.website ? { sameAs: [business.website] } : {}),
    ...(location ? { address: { '@type': 'PostalAddress', addressLocality: business.city, addressCountry: business.country } } : {}),
    ...(business.email || business.phone ? {
      contactPoint: {
        '@type': 'ContactPoint', contactType: 'sales',
        ...(business.email ? { email: business.email } : {}),
        ...(business.phone ? { telephone: business.phone } : {}),
      },
    } : {}),
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={`${business.name}${location ? ` — ${location}` : ''}`}
        description={description.slice(0, 155)}
        path={`/company/${business.username}`}
        image={business.logo_url || undefined}
        type="profile"
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />

      <header className="border-b border-border bg-gradient-to-b from-primary/5 to-transparent">
        <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <Avatar className="h-16 w-16 sm:h-20 sm:w-20 ring-2 ring-border">
              <AvatarImage src={business.logo_url} alt={`${business.name} logo`} />
              <AvatarFallback className="text-xl font-bold bg-primary/10 text-primary">{business.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">{business.name}</h1>
              <p className="text-xs text-primary">@{business.username}</p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {business.industry && <Badge variant="secondary" className="text-[10px]">{business.industry}</Badge>}
                {business.business_type && <Badge variant="outline" className="text-[10px]">{business.business_type}</Badge>}
                {location && <Badge variant="outline" className="text-[10px] gap-1"><MapPin className="w-3 h-3" />{location}</Badge>}
              </div>
              {business.description && <p className="text-sm text-muted-foreground mt-3 max-w-2xl">{business.description}</p>}
            </div>
            <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5" onClick={handleShare}>
              <Share2 className="w-3.5 h-3.5" />Share
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2">
          <h2 className="text-sm font-semibold text-foreground mb-3">Products & Services</h2>
          {items.length === 0 ? (
            <Card><CardContent className="py-10 text-center">
              <Package className="w-9 h-9 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">This business hasn't published its catalog yet.</p>
            </CardContent></Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {items.map(item => (
                <Card key={item.id}><CardContent className="p-4">
                  <Badge variant="secondary" className="text-[10px] capitalize mb-1.5">{item.kind}</Badge>
                  <h3 className="font-semibold text-sm text-foreground">{item.name}</h3>
                  {item.description && <p className="text-xs text-muted-foreground line-clamp-3 mt-1">{item.description}</p>}
                  <p className="text-sm font-semibold text-primary mt-2">
                    {formatMoney(item.price, item.currency)}{item.unit ? ` / ${item.unit}` : ''}
                  </p>
                </CardContent></Card>
              ))}
            </div>
          )}
        </section>

        <aside className="space-y-3">
          <Card><CardContent className="p-4 space-y-2 text-xs">
            <h2 className="text-sm font-semibold text-foreground mb-1">Contact</h2>
            {business.email && <a href={`mailto:${business.email}`} className="flex items-center gap-2 text-muted-foreground hover:text-primary break-all"><Mail className="w-3.5 h-3.5 shrink-0" />{business.email}</a>}
            {business.phone && <a href={`tel:${business.phone}`} className="flex items-center gap-2 text-muted-foreground hover:text-primary"><Phone className="w-3.5 h-3.5 shrink-0" />{business.phone}</a>}
            {business.website && <a href={business.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-muted-foreground hover:text-primary break-all"><Globe className="w-3.5 h-3.5 shrink-0" />{business.website}</a>}
            {business.address && <p className="flex items-start gap-2 text-muted-foreground"><MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />{business.address}</p>}
          </CardContent></Card>

          <Card className="bg-primary/5 border-primary/20"><CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground mb-2">Run your business on BizBase — catalog, CRM, invoices and a public page like this one.</p>
            <Button asChild size="sm" className="h-8 text-xs w-full"><Link to="/business-setup">List your business free</Link></Button>
          </CardContent></Card>
        </aside>
      </main>

      <Footer />
    </div>
  );
};

export default CompanyPage;
