import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import StartPageView from './src/components/OnBoarding/StartPage';
import Login from './src/components/Login/Login';
import ConfirmOtpView from './src/components/Login/ConfirmOtp';
import Register from './src/components/Register/Register';
import DashboardMenu from './src/components/OnBoarding/DashboardMenu';
import CovidTestView from './src/components/DashboardCovidTest/CovidTestView';
import SymptomView from './src/components/DashboardSymptoms/SymptomView';
import SelfIsolationView from './src/components/DashboardSelfIsolation/SelfIsolationView';
import TestResults from './src/components/DashboardTestResults/TestResults';
import ManageContactTracing from './src/components/DashboardContactTracing/ManageContactTracing';
const RootStack = createStackNavigator(
  {
    //OnBoarding
    StartPage: {screen: StartPageView},
    LoginPage: { screen: Login },
    RegisterPage: { screen: Register },
    ConfirmOtpPage: { screen: ConfirmOtpView },
    DashboardPage: { screen: DashboardMenu },
    CovidTestPage: { screen: CovidTestView },
    SymptomsPage: { screen: SymptomView },
    IsolationPage: { screen: SelfIsolationView },
    TestResultPage: { screen: TestResults },
    ManageContactsPage: { screen: ManageContactTracing },
  },
  {
    initialRouteName: 'StartPage',
    defaultNavigationOptions: { headerShown: true, cardStyle: { backgroundColor: '#F6F6F6' } }

  }
);

const App = createAppContainer(RootStack);

export default App;