# Astro Numerology Website

A professional astrology/numerology website that combines deterministic numerology calculations with AI-powered detailed readings.

## Features
- Driver, Conductor, and Name Number calculations
- Lo Shu Grid analysis (strengths & missing lines)
- Planet nature interpretation
- AI-generated detailed readings covering:
  - Core personality
  - Career & money guidance
  - Relationships
  - Health & balance
  - Lucky timing & numbers
  - Remedies & rituals

## Setup Instructions

### Prerequisites
- Node.js 18+ installed
- OpenAI API key

### Installation Steps

1. **Extract the ZIP file**

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure API Key**
   - Rename `.env.example` to `.env`
   - Add your OpenAI API key:
     ```
     OPENAI_API_KEY=sk-your-actual-key-here
     ```
   - **IMPORTANT**: Never share your API key publicly or commit it to version control

4. **Run the server**
   ```bash
   npm start
   ```

5. **Open in browser**
   - Navigate to: http://localhost:3000

## Usage
1. Enter full name
2. Select date of birth
3. Optionally add time of birth and location
4. Click "Generate Reading"
5. View your detailed numerology analysis

## Security Notes
- API key is stored server-side in `.env` file
- Never expose your API key in frontend code
- Add `.env` to `.gitignore` if using version control

## Tech Stack
- Frontend: HTML, CSS, Vanilla JavaScript
- Backend: Node.js, Express
- AI: OpenAI GPT-4o-mini
- Calculations: Pure JavaScript (deterministic numerology)

## File Structure
```
astro-website/
├── index.html       # Frontend UI
├── server.js        # Backend API
├── package.json     # Dependencies
├── .env.example     # Environment template
└── README.md        # This file
```

## Support
For issues or questions, refer to the OpenAI API documentation or Node.js guides.
