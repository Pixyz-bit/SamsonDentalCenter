import Pagination from '../../common/Pagination';

const AppointmentPagination = ({ page, totalPages, goToPage }) => {
    if (totalPages <= 1) return null;

    return (
        <div className='fixed bottom-0 left-0 right-0 sm:relative z-30 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md px-4 sm:px-6 py-2 sm:py-5 border-t border-gray-100 dark:border-gray-800 sm:shadow-none'>
            <div className='flex flex-col items-center justify-center w-full max-w-md mx-auto'>
                <div className='flex justify-center'>
                    <Pagination
                        currentPage={page}
                        totalPages={totalPages}
                        onPageChange={goToPage}
                    />
                </div>
            </div>
        </div>
    );
};

export default AppointmentPagination;
