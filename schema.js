export const planSchema = {
  program: {
    name: "",
    goal: "",
    durationWeeks: 12,
    difficulty: "",
    description: ""
  },

  athlete: {
    age: "",
    experience: "",
    trainingDays: 0,
    sessionLength: "",
    equipment: []
  },

  goals: {
    primary: "",
    secondary: [],
    targets: []
  },

  weeklySchedule: [
    {
      week: 1,
      focus: "",

      workouts: [
        {
          day: "",
          type: "",
          title: "",
          duration: "",
          exercises: []
        }
      ]
    }
  ],

  nutrition: {
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0
  },

  recovery: {
    sleepGoal: "",
    mobility: [],
    notes: []
  },

  milestones: [],

  achievements: [],

  education: []
};