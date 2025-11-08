import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import Layout from './App.tsx'
import Home from './pages/Home'
import TimeTool from './pages/TimeTool'
import BaseConvertTool from './pages/BaseConvertTool'
import EncodingTool from './pages/EncodingTool'
import YamlTool from './pages/YamlTool'
import FormatterTool from './pages/FormatterTool'
import PathPlanningTool from './pages/PathPlanningTool'
import RoboticsTool from './pages/RoboticsTool'
import MapTool from './pages/MapTool'
import JsonTool from './pages/JsonTool'
import DiagramTool from './pages/DiagramTool'
import CompareTool from './pages/CompareTool'
import Guestbook from './pages/Guestbook'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}> 
          <Route index element={<Home />} />
          <Route path="compare" element={<CompareTool />} />
          <Route path="time" element={<TimeTool />} />
          <Route path="base" element={<BaseConvertTool />} />
          <Route path="encoding" element={<EncodingTool />} />
          <Route path="json" element={<JsonTool />} />
          <Route path="yaml" element={<YamlTool />} />
          <Route path="formatter" element={<FormatterTool />} />
          <Route path="path" element={<PathPlanningTool />} />
          <Route path="robot" element={<RoboticsTool />} />
          <Route path="map" element={<MapTool />} />
        <Route path="diagram" element={<DiagramTool />} />
        <Route path="guestbook" element={<Guestbook />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
