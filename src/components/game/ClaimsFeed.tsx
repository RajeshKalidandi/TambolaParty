import React from 'react';
import type { Claim } from '../../types/game';

interface ClaimsFeedProps {
  claims: Claim[];
}

export default function ClaimsFeed({ claims }: ClaimsFeedProps) {
  return (
    <div className="bg-gray-800 rounded-lg p-4 max-h-40 overflow-y-auto">
      <h3 className="text-gray-300 font-medium mb-3">Recent Claims</h3>
      <div className="space-y-2">
        {claims.map((claim) => (
          <div key={claim.id} className="text-sm">
            <span className="text-cyan-400">{claim.playerName}</span>
            <span className="text-gray-400"> claimed </span>
            <span className="text-gray-300">{claim.prizeType}</span>
            <span className="text-gray-500 text-xs ml-2">
              {new Date(claim.timestamp).toLocaleTimeString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}