import { login, register } from "@/services/authService";
import { AuthContextProps, DecodedTokenProps, UserProps } from "@/types";
import { useRouter } from "expo-router";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext<AuthContextProps>({
  token: null,
  user: null,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  updateToken: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserProps | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadToken();
  },[])

  const loadToken = async () => {
    const storedToken = await AsyncStorage.getItem("token");
    if (storedToken) {
      try {
        const decoded = jwtDecode<DecodedTokenProps>(storedToken);
        if (decoded.exp && decoded.exp < Date.now() / 1000) {
          // token has expired, navigate to welcome page
          await AsyncStorage.removeItem("token");
          goToWelcomePage();
          return;
        }
        // user is logged in
        setToken(storedToken);
        setUser(decoded.user);
        goToHomePage();
      } catch (error) {
        // go to welcome page
        goToWelcomePage();
        console.log("Failed to decode the token: ", error);
      }
    } else {
      goToWelcomePage();
    }
  };

  const goToHomePage = () => {
    setTimeout(() => {
      router.replace("/(main)/home");
    }, 1500);
  };

  const goToWelcomePage = () => {
    setTimeout(() => {
      router.replace("/(auth)/welcome");
    }, 1500);
  };
  const updateToken = async (token: string) => {
    if (token) {
      setToken(token);
      await AsyncStorage.setItem("token", token);

      // Decode token(user)
      const decodedToken = jwtDecode<DecodedTokenProps>(token);
      console.log("Decoded Token: ", decodedToken);
      setUser(decodedToken.user);
    }
  };
  const signIn = async (email: string, password: string) => {
    const response = await login(email, password);
    await updateToken(response.token);
    router.replace("/(main)/home");
  };

  const signUp = async (
    email: string,
    password: string,
    name: string,
    avatar?: string | null
  ) => {
    const response = await register(email, password, name, avatar);
    await updateToken(response.token);
    router.replace("/(main)/home");
  };

  const signOut = async () => {
    setToken(null);
    setUser(null);
    await AsyncStorage.removeItem("token");
    router.replace("/(auth)/welcome");
  };

  return (
    <AuthContext.Provider
      value={{ token, user, signIn, signUp, signOut, updateToken }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
