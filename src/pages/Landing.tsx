import { Link } from 'react-router-dom';
import { Sparkles, Zap, Target, TrendingUp, Check } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <nav className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-8 h-8 text-blue-500" />
              <span className="text-2xl font-bold text-white">ContentForge AI</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-slate-300 hover:text-white transition-colors px-4 py-2"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <section className="pt-20 pb-32 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 mb-8">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span className="text-blue-400 text-sm font-medium">AI-Powered Content Generation</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Create Professional Blog
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              Content in Seconds
            </span>
          </h1>
          <p className="text-xl text-slate-400 mb-12 max-w-3xl mx-auto leading-relaxed">
            Transform your ideas into high-quality, SEO-optimized blog posts with the power of advanced AI.
            Save time, boost engagement, and scale your content strategy.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/signup"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all hover:scale-105 shadow-lg shadow-blue-500/20"
            >
              Start Creating Free
            </Link>
            <a
              href="#features"
              className="border border-slate-600 hover:border-slate-500 text-slate-300 hover:text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
            >
              Learn More
            </a>
          </div>
        </div>
      </section>

      <section id="features" className="py-20 px-4 bg-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Powerful Features for Content Creators
            </h2>
            <p className="text-xl text-slate-400">
              Everything you need to create compelling content at scale
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-8 hover:border-blue-500/50 transition-colors">
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-6">
                <Sparkles className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                AI-Powered Generation
              </h3>
              <p className="text-slate-400 leading-relaxed">
                Leverage cutting-edge AI models to generate high-quality, original content tailored to your needs.
              </p>
            </div>

            <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-8 hover:border-blue-500/50 transition-colors">
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-6">
                <Target className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                SEO Optimization
              </h3>
              <p className="text-slate-400 leading-relaxed">
                Automatic keyword integration and meta descriptions to help your content rank higher in search results.
              </p>
            </div>

            <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-8 hover:border-blue-500/50 transition-colors">
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Lightning Fast
              </h3>
              <p className="text-slate-400 leading-relaxed">
                Generate complete blog posts in seconds, not hours. Scale your content production effortlessly.
              </p>
            </div>

            <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-8 hover:border-blue-500/50 transition-colors">
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-6">
                <TrendingUp className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Customizable Tone
              </h3>
              <p className="text-slate-400 leading-relaxed">
                Choose from various tones and styles to match your brand voice and target audience perfectly.
              </p>
            </div>

            <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-8 hover:border-blue-500/50 transition-colors">
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-6">
                <Check className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Draft Management
              </h3>
              <p className="text-slate-400 leading-relaxed">
                Save, edit, and organize your generated content with an intuitive dashboard interface.
              </p>
            </div>

            <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-8 hover:border-blue-500/50 transition-colors">
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-6">
                <Sparkles className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Multi-Format Export
              </h3>
              <p className="text-slate-400 leading-relaxed">
                Export your content in various formats including Markdown, HTML, and plain text.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-slate-400">
              Choose the plan that fits your content needs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-8 hover:border-blue-500/50 transition-all hover:scale-105">
              <h3 className="text-2xl font-bold text-white mb-2">Free</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">$0</span>
                <span className="text-slate-400">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-slate-300">
                  <Check className="w-5 h-5 text-blue-400 mr-3 flex-shrink-0" />
                  10 blog posts per month
                </li>
                <li className="flex items-center text-slate-300">
                  <Check className="w-5 h-5 text-blue-400 mr-3 flex-shrink-0" />
                  Basic SEO optimization
                </li>
                <li className="flex items-center text-slate-300">
                  <Check className="w-5 h-5 text-blue-400 mr-3 flex-shrink-0" />
                  Standard tone options
                </li>
              </ul>
              <Link
                to="/signup"
                className="block w-full text-center bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Get Started
              </Link>
            </div>

            <div className="bg-gradient-to-b from-blue-600 to-blue-700 border-2 border-blue-500 rounded-xl p-8 relative transform scale-105 shadow-2xl shadow-blue-500/20">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-cyan-400 text-slate-900 px-4 py-1 rounded-full text-sm font-bold">
                POPULAR
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">$29</span>
                <span className="text-blue-100">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-white">
                  <Check className="w-5 h-5 text-cyan-300 mr-3 flex-shrink-0" />
                  50 blog posts per month
                </li>
                <li className="flex items-center text-white">
                  <Check className="w-5 h-5 text-cyan-300 mr-3 flex-shrink-0" />
                  Advanced SEO optimization
                </li>
                <li className="flex items-center text-white">
                  <Check className="w-5 h-5 text-cyan-300 mr-3 flex-shrink-0" />
                  All tone options
                </li>
                <li className="flex items-center text-white">
                  <Check className="w-5 h-5 text-cyan-300 mr-3 flex-shrink-0" />
                  Priority support
                </li>
              </ul>
              <Link
                to="/signup"
                className="block w-full text-center bg-white hover:bg-slate-100 text-blue-600 px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Start Pro Trial
              </Link>
            </div>

            <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-8 hover:border-blue-500/50 transition-all hover:scale-105">
              <h3 className="text-2xl font-bold text-white mb-2">Enterprise</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">$99</span>
                <span className="text-slate-400">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-slate-300">
                  <Check className="w-5 h-5 text-blue-400 mr-3 flex-shrink-0" />
                  Unlimited blog posts
                </li>
                <li className="flex items-center text-slate-300">
                  <Check className="w-5 h-5 text-blue-400 mr-3 flex-shrink-0" />
                  Custom AI model tuning
                </li>
                <li className="flex items-center text-slate-300">
                  <Check className="w-5 h-5 text-blue-400 mr-3 flex-shrink-0" />
                  API access
                </li>
                <li className="flex items-center text-slate-300">
                  <Check className="w-5 h-5 text-blue-400 mr-3 flex-shrink-0" />
                  Dedicated support
                </li>
              </ul>
              <Link
                to="/signup"
                className="block w-full text-center bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-700/50 py-12 px-4">
        <div className="max-w-7xl mx-auto text-center text-slate-400">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Sparkles className="w-6 h-6 text-blue-500" />
            <span className="text-xl font-bold text-white">ContentForge AI</span>
          </div>
          <p>&copy; 2026 ContentForge AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
