import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import ErrorBoundary from './components/common/ErrorBoundary';
import SessionTimeoutManager from './components/common/SessionTimeoutManager';
import useSmoothScroll from './hooks/useSmoothScroll';

const App = () => {
    useSmoothScroll();

    return (
        <BrowserRouter>
            <ErrorBoundary>
                <SessionTimeoutManager>
                    <AppRoutes />
                </SessionTimeoutManager>
            </ErrorBoundary>
        </BrowserRouter>
    );
};

export default App;




