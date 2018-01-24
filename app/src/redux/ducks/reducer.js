import { combineReducers } from "redux";

import memory from "./memory";
import profile from "./profile";
import others from "./others";
export default combineReducers({ memory, profile, others });
