import { motion } from 'framer-motion';
import { BookOpen, Search, ExternalLink } from 'lucide-react';
import { useState } from 'react';

const articles = [
  { title: 'How to Calculate Burn Rate', category: 'Finance', description: 'Understand how fast your startup is spending money and how to optimize it.', url: '#' },
  { title: 'TAM, SAM, SOM Explained', category: 'Market', description: 'Break down your total addressable market to find realistic revenue targets.', url: '#' },
  { title: 'Crafting a Competitive Moat', category: 'Strategy', description: 'Learn how to build sustainable competitive advantages early on.', url: '#' },
  { title: 'Reading Your SWOT Analysis', category: 'Analysis', description: 'How to interpret strengths, weaknesses, opportunities and threats effectively.', url: '#' },
  { title: 'Unit Economics 101', category: 'Finance', description: 'CAC, LTV, and why they matter for your startup survival.', url: '#' },
  { title: 'When to Pivot vs Persevere', category: 'Strategy', description: 'Data-driven frameworks for making the hardest startup decision.', url: '#' },
];

const categories = ['All', ...Array.from(new Set(articles.map(a => a.category)))];

export default function KnowledgeBasePage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = articles.filter(a => {
    const matchesSearch = a.title.toLowerCase().includes(search.toLowerCase()) || a.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'All' || a.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2 mb-1">
          <BookOpen className="h-5 w-5 text-primary" />
          Knowledge Base
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          Curated resources to help you build and evaluate your startup.
        </p>
      </motion.div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search articles..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-muted/30 border border-border/30 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
        />
      </div>

      {/* Category filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeCategory === cat
                ? 'bg-primary/20 text-primary'
                : 'text-muted-foreground hover:text-foreground bg-muted/20 hover:bg-muted/40'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Articles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filtered.map((article, i) => (
          <motion.a
            key={article.title}
            href={article.url}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass glass-hover rounded-xl p-5 group block"
          >
            <div className="flex items-start justify-between mb-2">
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                {article.category}
              </span>
              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition" />
            </div>
            <h3 className="text-sm font-semibold text-foreground mb-1.5">{article.title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{article.description}</p>
          </motion.a>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-12">No articles found.</p>
      )}
    </div>
  );
}
