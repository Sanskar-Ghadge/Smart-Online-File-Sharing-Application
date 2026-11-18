import{BrowserRouter,Routes,Route,Navigate}from"react-router-dom";
import{AuthProvider}from"./context/AuthContext";
import AuthPage from"./pages/AuthPage";
import MainPage from"./pages/MainPage";
import ChatPage from"./pages/ChatPage";
import GroupsPage from"./pages/GroupsPage";
import UsersPage from"./pages/UsersPage";
import WelcomeScreen from"./components/home/WelcomeScreen";
export default function App(){
  return(
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AuthPage/>}/>
          <Route path="/app" element={<MainPage/>}>
            <Route index element={<Navigate to="chat" replace/>}/>
            <Route path="chat" element={<ChatPage/>}/>
            <Route path="chat/:userId" element={<ChatPage/>}/>
            <Route path="groups" element={<GroupsPage/>}/>
            <Route path="users" element={<UsersPage/>}/>
            <Route path="*" element={<WelcomeScreen/>}/>
          </Route>
          <Route path="*" element={<Navigate to="/" replace/>}/>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}