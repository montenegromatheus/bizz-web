import { combineReducers } from "redux";
import snackReducer from "./snack-reducer";

const rootReducer = combineReducers({
  snackbar: snackReducer,
});

export default rootReducer;
