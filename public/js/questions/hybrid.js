// =====================================
// ATHLOS HYBRID ATHLETE MODULE
// public/js/questions/hybrid.js
// =====================================


export default [

    {
        id:"hybrid_priority",

        title:"What is your main priority?",

        description:
        "Athlos will balance your training around this focus.",

        type:"chips",

        options:[

            "Running",

            "Strength",

            "Sport Performance",

            "Equal Balance"

        ],

        condition:{

            question:"training_type",

            operator:"equals",

            value:"Hybrid"

        }

    },





    {
        id:"hybrid_goal",

        title:"What type of hybrid athlete are you becoming?",

        type:"chips",

        options:[

            "Run + Build Muscle",

            "Run + Strength",

            "Sport + Gym",

            "Triathlon Style",

            "General Athlete"

        ],

        condition:{

            question:"training_type",

            operator:"equals",

            value:"Hybrid"

        }

    },





    {
        id:"hybrid_training_split",

        title:"How do you currently split your training?",

        description:
        "Example: 3 runs + 3 gym sessions.",

        type:"text",

        multiline:true,

        placeholder:
        "Describe your weekly training",

        condition:{

            question:"training_type",

            operator:"equals",

            value:"Hybrid"

        }

    },





    {
        id:"hybrid_running_priority",

        title:"How important is running compared to strength?",

        type:"slider",

        min:0,

        max:10,

        default:5,

        unit:"running focus /10",

        condition:{

            question:"training_type",

            operator:"equals",

            value:"Hybrid"

        }

    },





    {
        id:"hybrid_strength_priority",

        title:"How important is strength training?",

        type:"slider",

        min:0,

        max:10,

        default:5,

        unit:"strength focus /10",

        condition:{

            question:"training_type",

            operator:"equals",

            value:"Hybrid"

        }

    },





    {
        id:"hybrid_current_sessions",

        title:"How many total training sessions do you currently complete?",

        type:"slider",

        min:1,

        max:14,

        default:5,

        unit:"sessions/week",

        condition:{

            question:"training_type",

            operator:"equals",

            value:"Hybrid"

        }

    },





    {
        id:"hybrid_conflict",

        title:"What is your biggest training challenge?",

        type:"chips",

        options:[

            "Finding time",

            "Recovery",

            "Balancing running and lifting",

            "Injuries",

            "Motivation",

            "Consistency"

        ],

        condition:{

            question:"training_type",

            operator:"equals",

            value:"Hybrid"

        }

    },





    {
        id:"hybrid_equipment",

        title:"What equipment do you have access to?",

        type:"chips",

        multiple:true,

        options:[

            "Full Gym",

            "Home Gym",

            "Dumbbells",

            "Barbell",

            "Running Track",

            "Sports Facilities",

            "Bodyweight Only"

        ],

        condition:{

            question:"training_type",

            operator:"equals",

            value:"Hybrid"

        }

    },





    {
        id:"hybrid_recovery",

        title:"How well do you currently recover?",

        type:"chips",

        options:[

            "Poor",

            "Average",

            "Good",

            "Excellent"

        ],

        condition:{

            question:"training_type",

            operator:"equals",

            value:"Hybrid"

        }

    },





    {
        id:"hybrid_target",

        title:"What achievement are you training towards?",

        type:"text",

        multiline:true,

        placeholder:
        "Example: Sub-20 5km while benching 80kg",

        condition:{

            question:"training_type",

            operator:"equals",

            value:"Hybrid"

        }

    }

];