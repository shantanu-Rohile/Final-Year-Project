// components/Account.jsx
import { User } from 'lucide-react';

export default function Account() {
  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-semibold" style={{ color: 'var(--txt)' }}>
            Account Settings
          </h2>
        </div>

        {/* Account content placeholder */}
        <div 
          className="rounded-2xl p-12 text-center border-8 border-[var(--bg-ter)]"
          style={{ backgroundColor: 'var(--bg-sec)' }}
        >
          <User 
            className="w-16 h-16 mx-auto mb-4"
            style={{ color: 'var(--txt-dim)' }}
          />
          <p 
            className="text-lg"
            style={{ color: 'var(--txt-dim)' }}
          >
            Account settings will be available soon
          </p>
        </div>
      </section>
    </div>
  );
}