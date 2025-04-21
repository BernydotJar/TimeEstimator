export const rpaToolSalaryIndexes: { [key: string]: number } = {
  "Blue Prism": 1.2,
  "UiPath": 1.1,
  "Automation Anywhere": 1.15,
  "Power APPs": 0.9,
  "Python": 1.0,
  "Power bi related": 0.8,
};

export const activityEffortMatrix: {
  [rpaTool: string]: {
    [applicationType: string]: {
      [detailedActivityType: string]: number;
    };
  };
} = {
  "Blue Prism": {
    "Desktop": {
      "Launch": 1,
      "Click": 0.5,
      "Read": 0.7,
      "Write": 0.8,
      "Send": 0.6,
      "Forms": 0.9,
      "Connector": 1.2,
    },
  },
  "UiPath": {
    "Web": {
      "Launch": 0.8,
      "Click": 0.4,
      "Read": 0.6,
      "Write": 0.7,
      "Send": 0.5,
      "Forms": 0.8,
      "Connector": 1.0,
    },
  },
  "Automation Anywhere": {
    "Terminal": {
      "Launch": 1.5,
      "Click": 0.75,
      "Read": 1.05,
      "Write": 1.2,
      "Send": 0.9,
      "Forms": 1.35,
      "Connector": 1.8,
    },
  },
  "Power APPs": {
    "Desktop": {
      "Launch": 0.6,
      "Click": 0.3,
      "Read": 0.4,
      "Write": 0.45,
      "Send": 0.3,
      "Forms": 0.5,
      "Connector": 0.6,
    },
  },
  "Python": {
    "Web": {
      "Launch": 0.9,
      "Click": 0.45,
      "Read": 0.65,
      "Write": 0.75,
      "Send": 0.55,
      "Forms": 0.85,
      "Connector": 1.1,
    },
  },
  "Power bi related": {
    "SAP": {
      "Launch": 0.5,
      "Click": 0.25,
      "Read": 0.35,
      "Write": 0.4,
      "Send": 0.25,
      "Forms": 0.45,
      "Connector": 0.6,
    },
  },
};

export const exceptionHandlingMultipliers: { [key: string]: number } = {
  "Basic": 0.05,
  "Medium": 0.1,
  "Complex": 0.2,
};