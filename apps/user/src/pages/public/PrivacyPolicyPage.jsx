import React from 'react';
import ReactMarkdown from 'react-markdown';
import PageHeader from '../../components/common/PageHeader';
import { useClinicSettings } from '../../hooks/useClinicSettings';

const PrivacyPolicyPage = () => {
    const { settings, loading } = useClinicSettings();

    if (loading) return <div className="min-h-screen animate-pulse bg-white" />;

    return (
        <>
            <PageHeader
                title='Privacy Policy'
                subtitle={`How we protect your data at ${settings?.clinic_name || 'our clinic'}.`}
            />
            <main className='py-16 bg-white'>
                <div className='max-w-4xl mx-auto px-6 prose prose-slate prose-lg'>
                    <ReactMarkdown>
                        {settings?.privacy_policy_text || 'Privacy policy content is being updated. Please check back soon.'}
                    </ReactMarkdown>
                </div>
            </main>
        </>
    );
};

export default PrivacyPolicyPage;
