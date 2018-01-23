import { NavigationActions } from "react-navigation";

const config = {};

export function setNavigator(nav) {
  if (nav) {
    config.navigator = nav;
  }
}

export function navigate(routeName, reset, params) {
  if (config.navigator && routeName) {
    var action;
    if (reset) {
      action = NavigationActions.reset({
        index: 0,
        key: null,
        actions: [NavigationActions.navigate({ routeName })]
      });
    } else {
      action = NavigationActions.navigate({ routeName, params });
    }

    config.navigator.dispatch(action);
  }
}

export function goBack() {
  if (config.navigator) {
    const action = NavigationActions.back({});
    config.navigator.dispatch(action);
  }
}
