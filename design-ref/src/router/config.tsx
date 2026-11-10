import type { RouteObject } from "react-router-dom";
import NotFound from "../pages/NotFound";
import RootRedirect from "../pages/RootRedirect";
import HomePage from "../pages/home/page";
import PlanPage from "../pages/plan/page";
import CalendarPage from "../pages/calendar/page";
import StudyPage from "../pages/study/page";
import QuizPage from "../pages/quiz/page";
import ReviewPage from "../pages/review/page";
import BooksPage from "../pages/books/page";
import ManagePage from "../pages/manage/page";

// 로그인 없이 바로 쓰는 서비스예요. 첫 화면은 계획 확정 여부에 따라 나뉩니다.
const routes: RouteObject[] = [
  { path: "/", element: <RootRedirect /> },
  { path: "/plan", element: <PlanPage /> },
  { path: "/calendar", element: <CalendarPage /> },
  { path: "/home", element: <HomePage /> },
  { path: "/study", element: <StudyPage /> },
  { path: "/quiz", element: <QuizPage /> },
  { path: "/review", element: <ReviewPage /> },
  { path: "/books", element: <BooksPage /> },
  { path: "/manage", element: <ManagePage /> },
  {
    path: "*",
    element: <NotFound />,
  },
];

export default routes;