# CropWise Nutrition

CropWise Nutrition is an intelligent, AI-powered web application designed to help families and communities in East Africa grow thriving, nutritious gardens. The app provides personalized crop recommendations, visual planting guides, expert feedback, and localized recipes to support users from seed to plate.

## ✨ Features

-   **🤖 AI-Powered Recommendations**: Get tailored crop suggestions based on location, land size, family/group size, and specific nutritional goals (e.g., iron-rich, maternal health).
-   **🏡 Dual Garden Modes**:
    -   **For My Family**: Perfect for individuals and families looking to start a home garden.
    -   **For My Community**: Designed for teachers, NGOs, or community health workers to plan larger gardens for schools or groups.
-   **🗺️ Visual Garden Layouts**: Automatically generates a simple, visual planting map based on your recommended crops and land size.
-   **📸 Snap My Garden**: Upload a photo of your existing garden to receive instant, AI-powered analysis, feedback, and actionable tips for improvement.
-   **🥘 Harvest-to-Plate Recipes**: Each recommended crop comes with a simple, localized recipe. Recipes can be read aloud with a text-to-speech feature to support users with low literacy.
-   **📚 Printable Training Guides**: The community mode allows users to generate comprehensive, printable training materials for their selected crops, perfect for educational settings.
-   **🏪 Find Agro-Dealers**: Locate nearby (fictional, for demo purposes) agro-dealers to find seeds and supplies.
-   **🎤 Voice-Enabled Interface**: Use your voice to fill out the recommendation form and hear a spoken summary of the results, enhancing accessibility.

## 🚀 Tech Stack

-   **Framework**: [Next.js](https://nextjs.org/) (with App Router)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **AI/Generative**: [Firebase Genkit](https://firebase.google.com/docs/genkit) with the Google AI (Gemini) plugin.
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
-   **Hosting**: Deployed on [Firebase App Hosting](https://firebase.google.com/docs/app-hosting)

## ⚙️ Getting Started

Follow these instructions to get a local copy up and running for development and testing purposes.

### Prerequisites

-   [Node.js](https://nodejs.org/) (v18 or later recommended)
-   [npm](https://www.npmjs.com/) (usually comes with Node.js)

### Installation

1.  **Clone the repository** (or start from your project template):
    ```sh
    git clone https://github.com/your-username/cropwise-nutrition.git
    cd cropwise-nutrition
    ```

2.  **Install NPM packages**:
    ```sh
    npm install
    ```

3.  **Set up Environment Variables**:
    Create a `.env` file in the root of the project and add your Google AI API key. You can get one from [Google AI Studio](https://aistudio.google.com/app/apikey).
    ```env
    GOOGLE_API_KEY=YOUR_API_KEY_HERE
    ```

### Running the Application

This project requires two separate development servers to be running simultaneously: one for the Next.js frontend and one for the Genkit AI backend.

1.  **Start the Genkit Dev Server**:
    Open a terminal and run:
    ```sh
    npm run genkit:dev
    ```
    This will start the Genkit development UI, typically on `http://localhost:4000`, where you can inspect your AI flows.

2.  **Start the Next.js Dev Server**:
    Open a *second* terminal and run:
    ```sh
    npm run dev
    ```
    This will start the main application frontend, typically on `http://localhost:9002`.

3.  **Open the app**:
    Navigate to `http://localhost:9002` in your browser to see the application in action.

## 📁 Project Structure

-   `src/app/`: Contains all the pages and layouts for the Next.js application, following the App Router structure.
-   `src/components/`: Shared React components used across the application, including UI components from ShadCN.
-   `src/ai/`:
    -   `flows/`: All Genkit AI flows are defined here. Each file represents a specific AI capability (e.g., `generate-crop-recommendations.ts`).
    -   `genkit.ts`: Genkit configuration file.
-   `src/lib/`: Utility functions.
-   `src/hooks/`: Custom React hooks.
-   `public/`: Static assets like images and fonts.

## 📄 License

Distributed under the MIT License.
