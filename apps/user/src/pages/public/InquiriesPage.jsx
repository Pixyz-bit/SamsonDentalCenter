import PageHeader from '../../components/common/PageHeader';
import SectionHeading from '../../components/common/SectionHeading';
import InquiryForm from '../../components/inquiries/InquiryForm';

const InquiriesPage = () => {
    return (
        <>
            <PageHeader
                title='Inquiries'
                subtitle="Have questions about our services? Send us a message and we'll get back to you shortly."
            />
            <section className='py-24 sm:py-32 bg-white relative overflow-hidden'>
                {/* Background Decor */}
                <div className='absolute top-0 right-0 w-150 h-150 bg-blue-600/5 rounded-full blur-[120px] -mr-40 -mt-40 pointer-events-none'></div>

                <div className='max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10'>
                    <div className='max-w-3xl mx-auto'>
                        <InquiryForm />
                    </div>
                </div>
            </section>
        </>
    );
};

export default InquiriesPage;
