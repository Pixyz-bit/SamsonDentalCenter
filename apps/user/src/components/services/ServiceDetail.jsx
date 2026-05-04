import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Clock, Shield, Sparkles, Activity, CheckCircle2 } from 'lucide-react';
import gsap from 'gsap';

// Comprehensive lookup for all 22 services
const SERVICE_DATA = {
    // GENERAL
    'complex diagnostics': {
        workflow: [
            { id: 1, title: 'AI-Enhanced Scanning', desc: 'Capturing 3D volumetric data of your entire oral structure.' },
            { id: 2, title: 'Multi-Disciplinary Review', desc: 'Our team analyzes nerve paths and bone density patterns.' },
            { id: 3, title: 'Digital Roadmap', desc: 'A complete virtual model of your treatment path is presented.' }
        ],
        duration: 60,
        guarantee: 'Precision Focus',
        desc: 'Utilizing state-of-the-art CBCT and digital scanning to create a micron-level map of your oral health.'
    },
    'professional hygiene': {
        workflow: [
            { id: 1, title: 'Biofilm Assessment', desc: 'Identifying bacterial colonies using specialized staining.' },
            { id: 2, title: 'Airflow Therapy', desc: 'Gentle removal of plaque and stains with warmed water and powder.' },
            { id: 3, title: 'Enamel Mineralization', desc: 'Applying high-concentration fluoride to strengthen tooth structure.' }
        ],
        duration: 45,
        guarantee: 'Plaque-Free',
        desc: 'A premium preventative treatment that goes far beyond traditional cleaning to protect your gums and enamel.'
    },
    'sedation and anaesthesia': {
        workflow: [
            { id: 1, title: 'Health Screening', desc: 'Comprehensive review of medical history and vital signs.' },
            { id: 2, title: 'Comfort Selection', desc: 'Choosing between nitrous oxide, oral, or IV sedation levels.' },
            { id: 3, title: 'Monitored Recovery', desc: 'Post-procedure care in our dedicated recovery suites.' }
        ],
        duration: 30,
        guarantee: 'Anxiety-Free',
        desc: 'Ensuring your absolute comfort through personalized sedation protocols administered by experts.'
    },
    'simple extraction': {
        workflow: [
            { id: 1, title: 'Local Numbing', desc: 'Targeted anaesthesia for a completely painless procedure.' },
            { id: 2, title: 'Atraumatic Removal', desc: 'Preserving the surrounding bone for future restorative options.' },
            { id: 3, title: 'Socket Preservation', desc: 'Closing the site to ensure rapid and clean healing.' }
        ],
        duration: 40,
        guarantee: 'Rapid Heal',
        desc: 'Expert removal of problematic teeth with a focus on preserving bone structure and patient comfort.'
    },
    'teeth whitening': {
        workflow: [
            { id: 1, title: 'Shade Matching', desc: 'Determining your current shade and target brightness.' },
            { id: 2, title: 'Gingival Protection', desc: 'Applying a barrier to protect your gums from the whitening gel.' },
            { id: 3, title: 'Laser Activation', desc: 'Three 15-minute cycles of light-activated premium whitening.' }
        ],
        duration: 60,
        guarantee: '8+ Shades',
        desc: 'Professional-grade whitening that removes deep stains and restores your natural radiance in one visit.'
    },
    'therapy': {
        workflow: [
            { id: 1, title: 'Decay Removal', desc: 'Cleaning the tooth structure with minimally invasive tools.' },
            { id: 2, title: 'Biomimetic Layering', desc: 'Using composite materials that mimic natural tooth flexibility.' },
            { id: 3, title: 'Bite Alignment', desc: 'Polishing and adjusting the restoration for perfect function.' }
        ],
        duration: 45,
        guarantee: 'Durable Fix',
        desc: 'Restoring tooth function and aesthetics using high-end materials that blend seamlessly with your smile.'
    },
    'orthodontics': {
        workflow: [
            { id: 1, title: '3D Simulation', desc: 'Visualizing your teeth moving into their ideal positions.' },
            { id: 2, title: 'Appliance Fitting', desc: 'Installing custom clear aligners or precision-bracket braces.' },
            { id: 3, title: 'Active Monitoring', desc: 'Regular digital check-ins to ensure your progress stays on track.' }
        ],
        duration: 30,
        guarantee: 'Straight Smile',
        desc: 'Correcting alignment and bite issues through modern, comfortable orthodontic solutions.'
    },
    'periodontal care': {
        workflow: [
            { id: 1, title: 'Pocket Mapping', desc: 'Measuring gum health and identifying areas of concern.' },
            { id: 2, title: 'Deep Debridement', desc: 'Removing infection from below the gumline using ultrasonics.' },
            { id: 3, title: 'Laser Sterilization', desc: 'Using light energy to eliminate bacteria and stimulate healing.' }
        ],
        duration: 60,
        guarantee: 'Gum Health',
        desc: 'Specialized therapy to arrest gum disease and restore the foundation of your dental health.'
    },
    'pediatric dentistry': {
        workflow: [
            { id: 1, title: 'Friendly Intro', desc: 'Getting your child comfortable with the dental environment.' },
            { id: 2, title: 'Gentle Exam', desc: 'Checking growth patterns and checking for early decay.' },
            { id: 3, title: 'Edu-Play', desc: 'Teaching your child proper brushing habits in a fun way.' }
        ],
        duration: 30,
        guarantee: 'Fear-Free',
        desc: 'Compassionate and fun dental care designed specifically for the unique needs of children.'
    },
    'dental crowns': {
        workflow: [
            { id: 1, title: 'Precision Shaping', desc: 'Preparing the tooth for its new protective shield.' },
            { id: 2, title: 'Digital Impression', desc: 'Scanning the prep for a perfect, custom-milled fit.' },
            { id: 3, title: 'Permanent Bonding', desc: 'Cementing the porcelain crown for long-term durability.' }
        ],
        duration: 90,
        guarantee: '10+ Years',
        desc: 'Full-coverage restorations that protect weakened teeth while restoring their natural look and feel.'
    },
    'tmj therapy': {
        workflow: [
            { id: 1, title: 'Joint Analysis', desc: 'Measuring jaw range of motion and checking for clicking/pain.' },
            { id: 2, title: 'Custom Splinting', desc: 'Creating a precision night guard to unload the joint.' },
            { id: 3, title: 'Guided Release', desc: 'Physiotherapy and exercises to relax the masticatory muscles.' }
        ],
        duration: 60,
        guarantee: 'Pain Relief',
        desc: 'Comprehensive solutions for jaw joint dysfunction, headaches, and teeth grinding.'
    },

    // SPECIALIZED
    'veneers': {
        workflow: [
            { id: 1, title: 'Smile Mock-up', desc: 'Trying on your new smile in wax before any work begins.' },
            { id: 2, title: 'Micro-Preparation', desc: 'Minimal removal of enamel to ensure a slim, natural fit.' },
            { id: 3, title: 'Master Finishing', desc: 'Individual hand-polishing for a lifelike, translucent glow.' }
        ],
        duration: 120,
        guarantee: 'Aesthetic Max',
        desc: 'Premium porcelain shells that transform the shape, color, and alignment of your smile.'
    },
    'dental implants': {
        workflow: [
            { id: 1, title: 'Surgical Guide', desc: 'Using 3D data to place the implant in the perfect position.' },
            { id: 2, title: 'Osseointegration', desc: 'Allowing the implant to fuse with your natural bone structure.' },
            { id: 3, title: 'Abutment & Crown', desc: 'Attaching the lifelike tooth that completes your smile.' }
        ],
        duration: 90,
        guarantee: 'Lifetime',
        desc: 'The gold standard for tooth replacement, offering unmatched stability and aesthetics.'
    },
    'all-on-x': {
        workflow: [
            { id: 1, title: 'Full Arch Scan', desc: 'Mapping your entire jaw for a full-set restoration.' },
            { id: 2, title: 'Strategic Placement', desc: 'Installing 4 or 6 implants to support the entire bridge.' },
            { id: 3, title: 'New Teeth Day', desc: 'Walking out with a fixed, beautiful set of temporary teeth.' }
        ],
        duration: 240,
        guarantee: 'Total Restore',
        desc: 'Replacing an entire arch of teeth on just a few implants for immediate function and confidence.'
    },
    'endodontics': {
        workflow: [
            { id: 1, title: 'Micro-Access', desc: 'Using high-magnification to enter the infected pulp chamber.' },
            { id: 2, title: 'Bio-Cleaning', desc: 'Neutralizing bacteria within the root canals using medicants.' },
            { id: 3, title: 'Hermetic Seal', desc: 'Filling the canals with biocompatible material to prevent re-infection.' }
        ],
        duration: 90,
        guarantee: 'Tooth Saved',
        desc: 'Specialized root canal therapy that eliminates pain and saves your natural tooth structure.'
    },
    'surgery': {
        workflow: [
            { id: 1, title: 'Site Prep', desc: 'Deep numbing and preparation of the surgical field.' },
            { id: 2, title: 'Precision Incision', desc: 'Using specialized tools for minimal tissue disruption.' },
            { id: 3, title: 'PRF Healing', desc: 'Using your own growth factors to accelerate the recovery process.' }
        ],
        duration: 60,
        guarantee: 'Expert Care',
        desc: 'Advanced surgical procedures ranging from wisdom tooth removal to complex oral pathology.'
    },
    'smile design': {
        workflow: [
            { id: 1, title: 'Facial Analysis', desc: 'Studying your lip line and facial symmetry for the perfect fit.' },
            { id: 2, title: 'Golden Ratio Prep', desc: 'Proportioning teeth to create an aesthetically pleasing smile.' },
            { id: 3, title: 'Final Blueprint', desc: 'The master plan that guides all future cosmetic procedures.' }
        ],
        duration: 60,
        guarantee: 'Ideal Proportions',
        desc: 'A comprehensive planning phase where we design your ultimate smile using digital facial analysis.'
    },
    'bone grafting': {
        workflow: [
            { id: 1, title: 'Site Evaluation', desc: 'Determining the volume and density of the deficient area.' },
            { id: 2, title: 'Graft Integration', desc: 'Applying biocompatible bone material to stimulate growth.' },
            { id: 3, title: 'Barrier Membrane', desc: 'Protecting the graft during the crucial early healing phase.' }
        ],
        duration: 90,
        guarantee: 'Solid Base',
        desc: 'Regenerating lost jawbone to provide the necessary support for dental implants.'
    },
    'sinus lifts': {
        workflow: [
            { id: 1, title: 'Membrane Access', desc: 'Gently accessing the sinus wall through a small window.' },
            { id: 2, title: 'Sinus Elevation', desc: 'Lifting the membrane to create space for new bone.' },
            { id: 3, title: 'Bone Infusion', desc: 'Filling the new space with high-quality grafting material.' }
        ],
        duration: 120,
        guarantee: 'Upper Support',
        desc: 'Highly specialized surgery to increase bone height in the upper jaw for secure implant placement.'
    },
    'full mouth reconstruction': {
        workflow: [
            { id: 1, title: 'Global Assessment', desc: 'Reviewing bite, joint health, and every single tooth.' },
            { id: 2, title: 'Phased Execution', desc: 'Strategically rebuilding the mouth section by section.' },
            { id: 3, title: 'Final Balancing', desc: 'Ensuring your new bite is perfectly functional and comfortable.' }
        ],
        duration: 180,
        guarantee: 'Complete Renewal',
        desc: 'A transformative multi-stage treatment to restore full function and aesthetics to the entire mouth.'
    },
    'laser gum surgery': {
        workflow: [
            { id: 1, title: 'LANAP Therapy', desc: 'Targeting diseased tissue without affecting healthy gums.' },
            { id: 2, title: 'Bio-Stimulation', desc: 'Using light energy to trigger your body’s natural healing.' },
            { id: 3, title: 'Tissue Reattachment', desc: 'Closing the gap between teeth and gums for a tight seal.' }
        ],
        duration: 60,
        guarantee: 'Suture-Free',
        desc: 'Advanced laser treatment for gum disease that eliminates the need for scalpels or stitches.'
    },
    'maxillofacial prosthetics': {
        workflow: [
            { id: 1, title: 'Defect Analysis', desc: 'Studying the area requiring complex rehabilitation.' },
            { id: 2, title: 'Custom Impression', desc: 'Creating a detailed mold for your specialized prosthesis.' },
            { id: 3, title: 'Fitting & Tuning', desc: 'Ensuring your new appliance restores speech and swallowing.' }
        ],
        duration: 120,
        guarantee: 'Functional Restore',
        desc: 'Highly specialized rehabilitation for complex oral defects to restore crucial life functions.'
    }
};

const ServiceDetail = ({ service: dbService, loading, error: dbError }) => {
    const { id } = useParams();
    const navigate = useNavigate();

    // Resolve service data from either DB or Static Data
    const staticMatchKey = Object.keys(SERVICE_DATA).find(key => 
        key === id || key.replace(/\s+/g, '-') === id
    );
    
    const staticService = staticMatchKey ? {
        id: id, // Use slug as ID for booking context if needed
        name: staticMatchKey.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        tier: id.includes('-') ? (id.split('-').length > 2 ? 'Specialized' : 'General') : 'Clinical Solution',
        ...SERVICE_DATA[staticMatchKey]
    } : null;

    const service = dbService || staticService;
    const isNotFound = !loading && !service;

    useEffect(() => {
        if (!loading && service) {
            const targets = gsap.utils.toArray('.detail-reveal');
            if (targets.length > 0) {
              gsap.fromTo(targets, 
                { y: 30, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out' }
              );
            }
        }
    }, [loading, service]);

    if (loading && !staticService) {
        return (
            <div className='min-h-[70vh] flex items-center justify-center bg-slate-50'>
                <div className='flex flex-col items-center gap-6'>
                    <div className='relative'>
                        <div className='w-16 h-16 border-4 border-sky-100 rounded-full'></div>
                        <div className='absolute inset-0 w-16 h-16 border-4 border-sky-500 border-t-transparent rounded-full animate-spin'></div>
                    </div>
                    <div className='text-center text-slate-400'>
                        <p className='text-slate-900 font-bold uppercase text-xs mb-2 animate-pulse'>Clinical Analysis</p>
                        <p className='text-sm'>Synchronizing data...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (isNotFound) {
        return (
            <div className='min-h-[70vh] flex flex-col items-center justify-center bg-slate-50 px-4 text-center'>
                <Activity size={40} className="text-amber-500 mb-6" />
                <h2 className='text-2xl font-bold text-slate-900 mb-2'>Service Not Found</h2>
                <button onClick={() => navigate('/services')} className='mt-8 bg-[#0B1120] text-white px-8 py-4 rounded-2xl font-bold'>
                    Return to Services
                </button>
            </div>
        );
    }

    const serviceKey = (service?.name || '').toLowerCase();
    const activeData = SERVICE_DATA[serviceKey] || {
        workflow: [
            { id: 1, title: 'Clinical Assessment', desc: 'A thorough evaluation of your oral health by our specialists.' },
            { id: 2, title: 'Specialized Treatment', desc: 'Expert application of the latest dental technologies and methods.' },
            { id: 3, title: 'Aftercare & Review', desc: 'Ensuring your results are maintained with professional guidance.' }
        ],
        duration: service?.duration_minutes || 60,
        guarantee: 'Expert Care',
        desc: service?.description || 'World-class dental care tailored to your unique clinical needs.'
    };

    return (
        <main className='bg-slate-50 min-h-screen pb-20'>
            {/* Header / Hero */}
            <div className='relative h-[350px] md:h-[450px] bg-[#0B1120] overflow-hidden flex items-end'>
                <div className='absolute inset-0 opacity-40'>
                    <img src="/images/services/service-chair-close.jpg" alt="" className="w-full h-full object-cover" />
                    <div className='absolute inset-0 bg-gradient-to-t from-[#0B1120] via-[#0B1120]/60 to-[#0B1120]/20'></div>
                </div>

                <div className='max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-16 relative z-10'>
                    <button onClick={() => navigate(-1)} className='flex items-center gap-2 text-sky-400 font-bold uppercase tracking-widest text-[10px] mb-8 transition-colors hover:text-white'>
                        <ChevronLeft size={14} /> Back to Clinical Solutions
                    </button>
                    
                    <div className='max-w-3xl'>
                        <div className='inline-flex items-center gap-2 px-3 py-1 bg-sky-500/20 border border-sky-500/30 rounded-full text-sky-400 text-[10px] font-bold uppercase tracking-widest mb-6 detail-reveal'>
                            <Sparkles size={12} /> {service.tier || 'Clinical Excellence'}
                        </div>
                        <h1 className='text-4xl md:text-6xl font-black text-white tracking-tight detail-reveal leading-none'>
                            {service.name}
                        </h1>
                    </div>
                </div>
            </div>

            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20'>
                <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
                    <div className='lg:col-span-2 space-y-8'>
                        <div className='bg-white rounded-[2rem] p-8 md:p-12 shadow-xl shadow-slate-200/60 border border-slate-100 detail-reveal'>
                            <h2 className='text-2xl font-bold text-slate-900 mb-6'>Clinical Overview</h2>
                            <p className='text-slate-600 text-lg leading-relaxed mb-12'>{activeData.desc}</p>
                            <div className='grid grid-cols-1 md:grid-cols-3 gap-8 pt-10 border-t border-slate-100'>
                                <div className='flex items-start gap-4'>
                                    <div className='w-12 h-12 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center shrink-0 shadow-sm'><Clock size={22} /></div>
                                    <div>
                                        <p className='text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1'>Duration</p>
                                        <p className='text-lg font-black text-slate-900'>{activeData.duration} min</p>
                                    </div>
                                </div>
                                <div className='flex items-start gap-4'>
                                    <div className='w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0 shadow-sm'><Shield size={22} /></div>
                                    <div>
                                        <p className='text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1'>Focus</p>
                                        <p className='text-lg font-black text-slate-900'>{activeData.guarantee}</p>
                                    </div>
                                </div>
                                <div className='flex items-start gap-4'>
                                    <div className='w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center shrink-0 shadow-sm'><Sparkles size={22} /></div>
                                    <div>
                                        <p className='text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1'>Precision</p>
                                        <p className='text-lg font-black text-slate-900'>AI-Driven</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className='bg-white rounded-[2rem] p-8 md:p-12 shadow-xl shadow-slate-200/60 border border-slate-100 detail-reveal'>
                            <h2 className='text-2xl font-bold text-slate-900 mb-10'>How It Works</h2>
                            <div className='space-y-12'>
                                {activeData.workflow.map((item, index) => (
                                    <div key={item.id} className='relative flex gap-8 group'>
                                        {index !== activeData.workflow.length - 1 && (
                                            <div className='absolute left-6 top-14 bottom-[-56px] w-0.5 bg-slate-100 group-hover:bg-sky-100 transition-colors'></div>
                                        )}
                                        <div className='w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 font-black text-slate-400 group-hover:bg-sky-500 group-hover:text-white group-hover:border-sky-500 transition-all shadow-sm'>
                                            {item.id}
                                        </div>
                                        <div>
                                            <h3 className='text-xl font-bold text-slate-900 mb-2 group-hover:text-sky-600 transition-colors'>{item.title}</h3>
                                            <p className='text-slate-500 leading-relaxed'>{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className='space-y-6 h-fit'>
                        <div className='bg-[#0B1120] rounded-[2rem] p-8 text-white shadow-2xl shadow-sky-900/20 detail-reveal'>
                            <p className='text-sky-400 font-bold uppercase tracking-[0.2em] text-[10px] mb-4'>Clinical Rate</p>
                            <div className='flex items-baseline gap-2 mb-8'>
                                <span className='text-4xl font-black'>₱{Number(service.price || 0).toLocaleString()}</span>
                                <span className='text-slate-400 text-xs font-medium'>Initial Estimate</span>
                            </div>
                            <ul className='space-y-5 mb-10'>
                                <li className='flex items-center gap-3 text-sm text-slate-300'><CheckCircle2 size={14} className='text-sky-500' /> Instant Confirmation</li>
                                <li className='flex items-center gap-3 text-sm text-slate-300'><CheckCircle2 size={14} className='text-sky-500' /> Expert Specialists</li>
                                <li className='flex items-center gap-3 text-sm text-slate-300'><CheckCircle2 size={14} className='text-sky-500' /> Zero Reschedule Fees</li>
                            </ul>
                            <button onClick={() => navigate(`/book?service=${service.id || id}`)} className='w-full bg-sky-500 hover:bg-sky-600 text-white font-bold py-5 rounded-2xl shadow-lg transition-all active:scale-95'>
                                Secure Appointment
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default ServiceDetail;
