import { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  Splash: undefined;
  Login: undefined;
  RoleSelection: undefined;
};

export type StudentTabParamList = {
  Home: undefined;
  Join: undefined;
  Leaderboard: { lobbyId?: string } | undefined;
  Performance: undefined;
  Profile: undefined;
};

export type StudentStackParamList = {
  StudentTabs: NavigatorScreenParams<StudentTabParamList> | undefined;
  StudentDashboard: undefined;
  JoinSprint: undefined;
  WaitingRoom: { lobbyCode: string } | undefined;
  LiveQuiz: { lobbyId: string } | undefined;
  Leaderboard: { lobbyId: string } | undefined;
  FinalResult: { lobbyId: string } | undefined;
  Solutions: { lobbyId: string } | undefined;
  Performance: undefined;
  Recommendations: undefined;
  History: undefined;
  Profile: undefined;
};

export type TeacherTabParamList = {
  Dashboard: undefined;
  Sprints: undefined;
  Analytics: undefined;
  Profile: undefined;
};

export type TeacherStackParamList = {
  TeacherTabs: NavigatorScreenParams<TeacherTabParamList> | undefined;
  TeacherDashboard: undefined;
  CreateSprint: undefined;
  SprintSettings: { sprintId?: string } | undefined;
  Lobby: { lobbyId: string } | undefined;
  LiveMonitoring: { lobbyId: string } | undefined;
  Results: { lobbyId: string } | undefined;
  Analytics: undefined;
  QuestionBank: undefined;
  AiGenerator: undefined;
  TeacherHistory: undefined;
  TeacherProfile: undefined;
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Student: NavigatorScreenParams<StudentStackParamList>;
  Teacher: NavigatorScreenParams<TeacherStackParamList>;
};
