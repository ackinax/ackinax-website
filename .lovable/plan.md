
# Rebuild the Nodes Page with Correct Content

The current `/nodes` page has placeholder content. The screenshots reveal 6 distinct sections that need to be implemented, all adapted to the existing dark theme with peach accents.

## Sections to Build

### 1. Hero Section
- **Headline**: "High-Performance Nodes," + "Built for Acki Nacki" (gradient text)
- **Subtitle**: "Enterprise-grade infrastructure with premium NetIX connectivity. Tailored specifically for the Acki Nacki network with optimized performance and reliability."
- **CTA**: "View Pricing" button (scrolls to pricing section)
- **Visual**: A decorative server illustration on the right (built with CSS/SVG -- two server icons in a rounded card)
- Two-column layout on desktop, stacked on mobile

### 2. "Why Choose Our Nodes?" Section
- **Subtitle**: "Purpose-built infrastructure designed to maximize your returns on the Acki Nacki network."
- Three cards in a row:
  - **High Performance** (Zap icon): "Optimized hardware configurations delivering consistent, reliable performance for Acki Nacki validation."
  - **Premium Connectivity** (Globe icon): "NetIX peering with direct routes to major networks ensuring minimal latency and maximum uptime."
  - **Enterprise Security** (Shield icon): "Multi-layered security with DDoS protection, encrypted connections, and 24/7 monitoring."

### 3. Pricing Section (id="pricing")
- Centered card with:
  - **Title**: "Node License"
  - **Subtitle**: "For Acki Nacki validators"
  - **Price**: EUR 20/month
  - Checklist: High-performance hardware, Premium NetIX connectivity, 24/7 monitoring, 99.9% uptime SLA, Technical support
  - **CTA**: "Subscribe Now" button (Stripe link)
  - **Footer**: "Need volume pricing? Contact us" (mailto link)

### 4. "Scalable by Nature" Section
- **Description**: "Our lower-density node infrastructure is designed to maximize your yields. With fewer nodes per server, each validator receives dedicated resources, resulting in more consistent performance and higher potential returns."
- Three stat cards: 99.9% Uptime Guarantee, 24/7 Active Monitoring, <1ms Network Latency
- Stats use peach-tinted card backgrounds

### 5. "Powered by 100% Renewable Energy" Section
- Large card with leaf icon
- **Description**: "Our data center is powered entirely by renewable energy sources. We're committed to sustainable blockchain infrastructure, ensuring that your participation in the network contributes to a greener future."
- Three pill tags: Solar Energy, Wind Power, Carbon Neutral

### 6. "World-Class Infrastructure" Section
- **Subtitle**: "Our datacenter facilities meet the highest industry standards for security, connectivity, and reliability."
- Five cards in 3+2 grid:
  - Heart of Europe's Connectivity (MapPin): "Strategically located at Europe's connectivity center, providing optimal routing to all major networks."
  - Most Connected Datacenter (Network): "Direct peering with all major service providers ensuring the lowest latency and best route optimization."
  - End-to-end Fiber Connectivity (Zap): "Full fiber infrastructure delivering ultra-low latency connections across the entire network path."
  - Enterprise Level Hardware (Cpu): "Latest generation server hardware with redundant components for maximum reliability and performance."
  - ISO Certified (ShieldCheck): "ISO 27001, ISO 22301, and ISO 50001 certifications ensuring the highest standards in security, business continuity, and energy management."

### 7. CTA / Contact Section
- Keep existing "Questions?" section with contact mailto link

## Technical Details

- **File modified**: `src/pages/Nodes.tsx` -- full rewrite with the correct content
- **Styling**: All sections use the existing dark theme classes (`card-base`, `section-label`, `btn-primary`, `btn-ghost`, `font-heading`, `font-body`, etc.)
- **Icons**: Use lucide-react icons (Zap, Globe, Shield, MapPin, Network, Cpu, ShieldCheck, Leaf, Server, CheckCircle2)
- **Animations**: Continue using `useScrollReveal` hook for scroll-triggered fade-in on each section
- **Responsive**: Grid layouts collapse to single column on mobile
- **Logo**: Keep the uploaded logo-v2.svg in the nav area
- **Stripe links**: Preserved from current implementation for Subscribe button
- **Navbar**: Reuse existing shared Navbar from homepage instead of the custom inline nav
