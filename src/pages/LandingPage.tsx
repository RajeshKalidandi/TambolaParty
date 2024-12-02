import React from 'react';
import { useNavigate } from 'react-router-dom';
import Hero from '../components/Hero';
import Features from '../components/Features';
import HowToPlay from '../components/HowToPlay';
import Footer from '../components/Footer';

export default function LandingPage() {
  const navigate = useNavigate();

  const handleHostGame = () => {
    navigate('/create');
  };

  const handleJoinGame = () => {
    navigate('/lobby');
  };

  return (
    <div className="min-h-screen">
      <Hero onHost={handleHostGame} onJoin={handleJoinGame} />
      <Features />
      <HowToPlay />
      <Footer />
    </div>
  );
}