import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Activity, ArrowRight, Code, GraduationCap, MapPin,
  PartyPopper, Search, ShieldCheck, Star, Wrench, type LucideIcon
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserAvatar } from '../components/UserAvatar';
import { ProviderCard } from '../components/ProviderCard';
import { rankProvidersWithAI } from '../utils/aiRecommendationEngine';
import { INDIAN_CITIES } from '../data/mockData';
import './HomeLandingPage.css';

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  GraduationCap,
  Activity,
  Code,
  Wrench,
  PartyPopper,
};

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { categories, providers, currentCity, setCurrentCity } = useApp();
  const approvedProviders = providers.filter((provider) => provider.verificationStatus === 'VERIFIED' && !provider.isDemo);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState(currentCity);
  const recommendedResults = rankProvidersWithAI(approvedProviders, undefined, undefined, selectedCity);
  const averageRating = approvedProviders.length
    ? (approvedProviders.reduce((total, provider) => total + provider.rating, 0) / approvedProviders.length).toFixed(1)
    : null;

  const handleHeroSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setCurrentCity(selectedCity);
    const query = searchQuery.trim();
    navigate(query
      ? `/providers?q=${encodeURIComponent(query)}&city=${encodeURIComponent(selectedCity)}`
      : `/providers?city=${encodeURIComponent(selectedCity)}`);
  };

  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="home-shell home-hero-layout">
          <div className="home-hero-copy">
            <p className="home-eyebrow"><span /> Good people, good work</p>
            <h1>The right help makes <em>all the difference.</em></h1>
            <p className="home-intro">
              Find skilled, verified people for the work, care, and celebrations that matter.
            </p>

            <form onSubmit={handleHeroSearch} className="home-search" role="search">
              <label className="home-search-service">
                <span>What do you need help with?</span>
                <span className="home-input-wrap">
                  <Search aria-hidden="true" />
                  <input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Try “maths tutor” or “AC repair”"
                  />
                </span>
              </label>
              <label className="home-search-city">
                <span>Your city</span>
                <span className="home-input-wrap">
                  <MapPin aria-hidden="true" />
                  <select value={selectedCity} onChange={(event) => setSelectedCity(event.target.value)}>
                    {INDIAN_CITIES.map((city) => <option key={city} value={city}>{city}</option>)}
                  </select>
                </span>
              </label>
              <button type="submit" className="home-search-submit" aria-label="Find a professional">
                <span>Find a professional</span><ArrowRight aria-hidden="true" />
              </button>
            </form>

            <div className="home-proof-line">
              <div className="home-proof-avatars" aria-hidden="true">
                {approvedProviders.slice(0, 3).map((provider) => <UserAvatar key={provider.id} src={provider.avatar} name={provider.name} className="home-proof-avatar" />)}
              </div>
              <span><strong>{approvedProviders.length} local professionals</strong> ready to lend a hand</span>
              <span className="home-proof-divider" />
              {averageRating && <span className="home-rating"><Star fill="currentColor" aria-hidden="true" /> {averageRating} <span>average rating</span></span>}
            </div>
          </div>

          <div className="home-hero-visual">
            <img
              src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1100&q=85"
              alt="Technology professionals discussing a project together at their workspace"
            />
            <span className="home-image-index">01 <i /> 05</span>
          </div>
        </div>
      </section>

      <section className="home-categories home-shell" aria-labelledby="categories-title">
        <div className="home-section-heading">
          <div>
            <p className="home-eyebrow">A good place to start</p>
            <h2 id="categories-title">What can we help with?</h2>
          </div>
          <Link to="/services" className="home-text-link">Browse every service <ArrowRight aria-hidden="true" /></Link>
        </div>

        <div className="home-category-grid">
          {categories.map((category, index) => {
            const Icon = CATEGORY_ICONS[category.iconName] || Wrench;
            return (
              <Link
                to={`/services/${category.slug}`}
                className={`home-category home-category-${index + 1}`}
                key={category.id}
              >
                <span className="home-category-icon"><Icon aria-hidden="true" /></span>
                <span className="home-category-copy">
                  <strong>{category.name.toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase())}</strong>
                  <small>{category.popularServices.slice(0, 2).join(' · ')}</small>
                </span>
                <ArrowRight className="home-category-arrow" aria-hidden="true" />
              </Link>
            );
          })}
        </div>
      </section>

      <section className="home-how">
        <div className="home-shell home-how-layout">
          <div className="home-how-intro">
            <p className="home-eyebrow">Simple from the start</p>
            <h2>Good help, without the guesswork.</h2>
            <p>From the first search to the finished job, you stay in control.</p>
            <Link to="/how-it-works" className="home-text-link">How it works <ArrowRight aria-hidden="true" /></Link>
          </div>
          <ol className="home-steps">
            <li><span>01</span><strong>Tell us what you need</strong><small>Search a service or browse by category.</small></li>
            <li><span>02</span><strong>Meet your shortlist</strong><small>Compare experience, reviews, and pricing.</small></li>
            <li><span>03</span><strong>Book with confidence</strong><small>Choose a time that works for you.</small></li>
          </ol>
        </div>
      </section>

      <section className="home-shell home-professionals" aria-labelledby="professionals-title">
        <div className="home-section-heading">
          <div>
            <p className="home-eyebrow">People nearby</p>
            <h2 id="professionals-title">A few local favourites</h2>
            <p className="home-section-note">Well-reviewed professionals serving {selectedCity}.</p>
          </div>
          <Link to="/providers" className="home-text-link">Meet everyone <ArrowRight aria-hidden="true" /></Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendedResults.slice(0, 3).map(({ provider }) => (
            <ProviderCard key={provider.id} provider={provider} />
          ))}
        </div>
      </section>

      <section className="home-bottom-cta">
        <div className="home-shell home-cta-layout">
          <div><p className="home-eyebrow">For independent professionals</p><h2>Good at what you do? Let your city know.</h2></div>
          <Link to="/register?role=provider" className="home-cta-button">Join the community <ArrowRight aria-hidden="true" /></Link>
        </div>
      </section>
    </div>
  );
};