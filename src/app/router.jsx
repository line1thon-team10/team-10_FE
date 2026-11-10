import { createBrowserRouter } from 'react-router';
import FocusLayout from '@/components/layout/FocusLayout.jsx';
import MainLayout from '@/components/layout/MainLayout.jsx';
import SetupLayout from '@/components/layout/SetupLayout.jsx';
import BooksPage from '@/pages/books/S9Books.jsx';
import CalendarPage from '@/pages/calendar/CalendarTab.jsx';
import DevPage from '@/pages/dev/DevPage.jsx';
import HomePage from '@/pages/home/S6Home.jsx';
import NotFound from '@/pages/NotFound.jsx';
import QuizPage from '@/pages/quiz/S8Quiz.jsx';
import QuizResultPage from '@/pages/quiz/S8_2Result.jsx';
import ReviewPage from '@/pages/review/S10Review.jsx';
import StudyPage from '@/pages/study/S12Study.jsx';
import S1Schedule from '@/pages/setup/S1Schedule.jsx';
import S2Calendar from '@/pages/setup/S2Calendar.jsx';
import S3Upload from '@/pages/setup/S3Upload.jsx';
import S3_2Toc from '@/pages/setup/S3_2Toc.jsx';
import S4Units from '@/pages/setup/S4Units.jsx';
import S5Review from '@/pages/setup/S5Review.jsx';
import S5_1Resplit from '@/pages/setup/S5_1Resplit.jsx';
import S5_2Compare from '@/pages/setup/S5_2Compare.jsx';
import { ROUTES } from './screens.js';

// 주소는 screens.js의 ROUTES 상수만 써요. 화면 코드에 '/quiz' 같은 문자열을 직접 쓰지 않아요.
export const router = createBrowserRouter([
  {
    element: <SetupLayout />,
    children: [
      { path: ROUTES.s1, element: <S1Schedule /> },
      { path: ROUTES.s2, element: <S2Calendar /> },
      { path: ROUTES.s3, element: <S3Upload /> },
      { path: ROUTES.s3_2, element: <S3_2Toc /> },
      { path: ROUTES.s4, element: <S4Units /> },
      { path: ROUTES.s5, element: <S5Review /> },
      { path: ROUTES.s5_1, element: <S5_1Resplit /> },
      { path: ROUTES.s5_2, element: <S5_2Compare /> },
    ],
  },
  { element: <FocusLayout />, children: [{ path: ROUTES.study, element: <StudyPage /> }] },
  {
    element: <MainLayout />,
    children: [
      { path: ROUTES.home, element: <HomePage /> },
      { path: ROUTES.quiz, element: <QuizPage /> },
      { path: ROUTES.quizResult, element: <QuizResultPage /> },
      { path: ROUTES.books, element: <BooksPage /> },
      { path: ROUTES.review, element: <ReviewPage /> },
      { path: ROUTES.calendar, element: <CalendarPage /> },
      { path: ROUTES.dev, element: <DevPage /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);
