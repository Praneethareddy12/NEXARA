import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios"; 
import "./CourseDetail.css";

/* ================= COURSE MODULE DATA ================= */

const courseContent = {
  "1": {
    name: "Python Fundamentals",
    modules: [
      {
        title: "Python Basics",
        video: "https://www.youtube.com/embed/_uQrJ0TkZlc",
        text: "Learn variables, data types, loops, and functions in Python.",
        code: "print('Hello Python')"
      },
      {
        title: "Control Flow",
        video: "https://www.youtube.com/embed/kqtD5dpn9C8",
        text: "Understand if-else, loops, and logic building.",
        code: "for i in range(5): print(i)"
      },
      {
        title: "Functions & Modules",
        video: "https://www.youtube.com/embed/9Os0o3wzS_I",
        text: "Create reusable functions and import modules.",
        code: "def greet(name): return f'Hello {name}'"
      },
      {
        title: "File Handling",
        video: "https://www.youtube.com/embed/Uh2ebFW8OYM",
        text: "Read and write files using Python.",
        code: "with open('file.txt','r') as f: print(f.read())"
      }
    ]
  },
  "2": {
    name: "Python for Data Science",
    modules: [
      {
        title: "NumPy Basics",
        video: "https://www.youtube.com/embed/QUT1VHiLmmI",
        text: "Learn array operations and numerical computing.",
        code: "import numpy as np\nnp.array([1,2,3])"
      },
      {
        title: "Pandas Introduction",
        video: "https://www.youtube.com/embed/vmEHCJofslg",
        text: "Work with DataFrames and Series.",
        code: "import pandas as pd\ndf = pd.read_csv('data.csv')"
      },
      {
        title: "Data Cleaning",
        video: "https://www.youtube.com/embed/8rXD5-xhemo",
        text: "Handle missing values and preprocess data.",
        code: "df.dropna()"
      },
      {
        title: "Exploratory Data Analysis",
        video: "https://www.youtube.com/embed/xi0vhXFPegw",
        text: "Perform summary statistics and visualization.",
        code: "df.describe()"
      }
    ]
  },
  "3": {
    name: "NumPy & Pandas Mastery",
    modules: [
      {
        title: "Advanced NumPy",
        video: "https://www.youtube.com/embed/GB9ByFAIAH4",
        text: "Broadcasting and vectorized operations.",
        code: "np.arange(10).reshape(2,5)"
      },
      {
        title: "Advanced Pandas",
        video: "https://www.youtube.com/embed/vmEHCJofslg",
        text: "GroupBy, Merge, and Join operations.",
        code: "df.groupby('col').sum()"
      },
      {
        title: "Time Series Data",
        video: "https://www.youtube.com/embed/1XmJqM5pXqs",
        text: "Working with datetime objects.",
        code: "pd.to_datetime(df['date'])"
      },
      {
        title: "Performance Optimization",
        video: "https://www.youtube.com/embed/KdmPHEnPJPs",
        text: "Speed up data processing.",
        code: "df.apply(lambda x: x*2)"
      }
    ]
  },
  "4": {
    name: "Statistics & Probability",
    modules: [
      {
        title: "Descriptive Statistics",
        video: "https://www.youtube.com/embed/xxpc-HPKN28",
        text: "Mean, median, variance, standard deviation.",
        code: "import statistics"
      },
      {
        title: "Probability Basics",
        video: "https://www.youtube.com/embed/KZFf1lW6zGY",
        text: "Random variables and distributions.",
        code: "from scipy import stats"
      },
      {
        title: "Hypothesis Testing",
        video: "https://www.youtube.com/embed/0oc49DyA3hU",
        text: "Understand p-values and significance.",
        code: "stats.ttest_ind(a,b)"
      },
      {
        title: "Regression Analysis",
        video: "https://www.youtube.com/embed/nk2CQITm_eo",
        text: "Linear regression fundamentals.",
        code: "from sklearn.linear_model import LinearRegression"
      }
    ]
  },
  "5": {
    name: "Machine Learning Foundations",
    modules: [
      {
        title: "ML Overview",
        video: "https://www.youtube.com/embed/GwIo3gDZCVQ",
        text: "Supervised vs Unsupervised learning.",
        code: "# ML basics"
      },
      {
        title: "Linear Regression",
        video: "https://www.youtube.com/embed/PaFPbb66DxQ",
        text: "Build regression models.",
        code: "model.fit(X,y)"
      },
      {
        title: "Classification",
        video: "https://www.youtube.com/embed/zM4VZR0px8E",
        text: "Logistic Regression & Decision Trees.",
        code: "from sklearn.tree import DecisionTreeClassifier"
      },
      {
        title: "Model Evaluation",
        video: "https://www.youtube.com/embed/85dtiMz9tSo",
        text: "Accuracy, Precision, Recall.",
        code: "from sklearn.metrics import accuracy_score"
      }
    ]
  },
  "6": {
    name: "Deep Learning & Neural Networks",
    modules: [
      {
        title: "Neural Network Basics",
        video: "https://www.youtube.com/embed/aircAruvnKk",
        text: "Understand neurons and layers.",
        code: "# Neural Network structure"
      },
      {
        title: "Activation Functions",
        video: "https://www.youtube.com/embed/Xvg00QnyaIY",
        text: "ReLU, Sigmoid, Tanh.",
        code: "tf.keras.activations.relu"
      },
      {
        title: "Backpropagation",
        video: "https://www.youtube.com/embed/Ilg3gGewQ5U",
        text: "Gradient descent explained.",
        code: "# Backprop algorithm"
      },
      {
        title: "Building CNN with TensorFlow",
        video: "https://www.youtube.com/embed/tPYj3fFJGjk",
        text: "Create CNN models for image classification.",
        code: "model = tf.keras.models.Sequential()"
      }
    ]
  }
};

/* ================= COMPONENT ================= */

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const course = courseContent[id];

  const [activeModuleIndex, setActiveModuleIndex] = useState(0);
  const [completedModules, setCompletedModules] = useState({});

  // 1. Fetch progress on mount
  useEffect(() => {
    const fetchUserProgress = async () => {
      try {
        const res = await api.get("/api/auth/profile");
        const rawProgress = res.data.completedModules || [];
        
        const progressObj = {};
        rawProgress.forEach((item) => {
          const [courseId, modIdx] = item.split("-");
          if (!progressObj[courseId]) progressObj[courseId] = [];
          progressObj[courseId].push(parseInt(modIdx));
        });
        
        setCompletedModules(progressObj);
      } catch (err) {
        console.error("Failed to load user progress.");
      }
    };
    if (id) fetchUserProgress();
  }, [id]);

  if (!course) {
    return <div style={{ padding: "40px" }}>Course not found</div>;
  }

  const currentModule = course.modules[activeModuleIndex];

  // 2. Mark complete and save to MongoDB
  const completeModule = async () => {
    try {
      const res = await api.post("/api/auth/update-progress", {
        xpToAdd: 500,
        moduleId: id,
        moduleIndex: activeModuleIndex
      });

      if (res.status === 200) {
        let updated = { ...completedModules };
        if (!updated[id]) updated[id] = [];
        if (!updated[id].includes(activeModuleIndex)) {
          updated[id].push(activeModuleIndex);
        }
        setCompletedModules(updated);

        if (res.data.leveledUp) {
          alert(`🎉 Level Up! You are now Level ${res.data.level}`);
        }

        if (activeModuleIndex < course.modules.length - 1) {
          setActiveModuleIndex(activeModuleIndex + 1);
        } else {
          alert("🎉 Course Completed!");
          navigate("/dashboard");
        }
      }
    } catch (err) {
      console.error("Error updating progress:", err);
      alert("Progress couldn't be saved.");
    }
  };

  return (
    <div className="course-detail-page">
      <nav className="course-nav">
        <div className="nav-container">
          <button onClick={() => navigate("/paths")} className="back-btn">
            ← Back to Paths
          </button>
          <span className="course-nav-title">
            {course.name} - {currentModule.title}
          </span>
          <div className="brand-logo">✨ Nexara</div>
        </div>
      </nav>

      <div className="course-layout">
        <aside className="course-sidebar">
          <h3>Modules</h3>
          {course.modules.map((mod, index) => (
            <div
              key={index}
              className={`sidebar-item ${activeModuleIndex === index ? "active" : ""}`}
              onClick={() => setActiveModuleIndex(index)}
            >
              {mod.title}
              {completedModules[id]?.includes(index) && (
                <span style={{ marginLeft: "8px", color: "green" }}> ✔</span>
              )}
            </div>
          ))}
        </aside>

        <main className="course-article">
          <h1>{currentModule.title}</h1>

          <div className="video-container">
            <iframe
              width="100%"
              height="100%"
              src={currentModule.video}
              title="Video"
              frameBorder="0"
              allowFullScreen
            ></iframe>
          </div>

          <div className="article-content">
            <p>{currentModule.text}</p>
            <pre className="code-block">
              <code>{currentModule.code}</code>
            </pre>
          </div>

          <div className="article-footer">
            <button className="complete-btn" onClick={completeModule}>
              {activeModuleIndex === course.modules.length - 1 
                ? "Finish Course & Claim XP" 
                : "Mark as Complete & Next →"}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}