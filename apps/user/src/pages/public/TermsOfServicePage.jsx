import React from 'react';
import ReactMarkdown from 'react-markdown';
import PageHeader from '../../components/common/PageHeader';
import { useClinicSettings } from '../../hooks/useClinicSettings';

const TermsOfServicePage = () => {
    const { settings, loading } = useClinicSettings();

    if (loading) return <div className="min-h-screen animate-pulse bg-white" />;

    return (
        <>
            <PageHeader
                title='Terms of Service'
                subtitle={`The terms and conditions for using ${settings?.clinic_name || 'our clinic'}'s services.`}
            />
            <main className='py-16 bg-white'>
                <div className='max-w-4xl mx-auto px-6 prose prose-slate prose-lg'>
                    <ReactMarkdown>
                        {settings?.terms_of_service_text || 'Terms of service content is being updated. Please check back soon.'}
                    </ReactMarkdown>
                </div>
            </main>
        </>
    );
};

export default TermsOfServicePage;
