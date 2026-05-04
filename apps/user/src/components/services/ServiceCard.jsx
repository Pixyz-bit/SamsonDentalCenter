import { useNavigate } from 'react-router-dom';

const ServiceCard = ({ service }) => {
    const navigate = useNavigate();

    return (
        <div
            onClick={() => navigate(`/services/${service.id}`)}
            className='bg-white rounded-2xl p-6 shadow-sm border border-stone-200/80
                       hover:shadow-md hover:border-red-200 hover:-translate-y-0.5 transition-all duration-200 ease-in-out cursor-pointer group flex flex-col h-full'
        >
            <div className='flex flex-col gap-2 grow'>
                <h3 className='text-[clamp(1.125rem,1vw+0.5rem,1.25rem)] font-bold text-stone-900 group-hover:text-red-600 transition-colors duration-200 ease-in-out tracking-tight'>
                    {service.name}
                </h3>
                <p className='text-[clamp(0.875rem,0.5vw+0.5rem,1rem)] text-stone-600 line-clamp-3 leading-relaxed'>
                    {service.description}
                </p>
            </div>
            <div className='flex items-center justify-between pt-4 mt-4 border-t border-stone-200/80'>
                <span className='text-red-600 font-medium text-sm bg-red-50/80 px-3 py-1.5 rounded-xl'>
                    ⏱ {service.duration_minutes} min
                </span>
                {service.price && (
                    <span className='text-stone-900 font-bold'>
                        ₱{Number(service.price).toLocaleString()}
                    </span>
                )}
            </div>
        </div>
    );
};

export default ServiceCard;
