import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";

import ReferenceWorkspace, { ReferenceHistory } from "./pages/ReferenceWorkspace";
import NotFound from "./pages/NotFound";
import { StakeholderPopupProvider } from "./contexts/StakeholderPopupContext";
import { StakeholderPopup } from "./components/stakeholder/StakeholderPopup";
import { EventPopupProvider } from "./contexts/EventPopupContext";
import { EventDetailPopup } from "./components/calendar/EventDetailPopup";
import { SignalsInitializer } from "./components/SignalsInitializer";


import { workspaceDestination } from "./lib/workspaceRoutes";
function LegacyWorkspaceLink(){const location=useLocation();return <Navigate replace to={workspaceDestination(location.pathname,location.search)}/>;}

const queryClient = new QueryClient();

function KeepFloatingDemo() {
 const location=useLocation(); const navigate=useNavigate();
 useEffect(()=>{const query=new URLSearchParams(location.search);if(query.get("demo")!=="floating"){query.set("demo","floating");navigate({...location,search:`?${query}`},{replace:true});}},[location,navigate]);
 return null;
}

const App = ({floatingDemo=false}:{floatingDemo?:boolean}) => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter basename="/loomik">
    {floatingDemo && <KeepFloatingDemo />}
    <TooltipProvider>
      <StakeholderPopupProvider>
        <EventPopupProvider>
          <Toaster />
          <Sonner />
          <SignalsInitializer />

          <StakeholderPopup />
          <EventDetailPopup />
            <Routes>
              <Route path="/" element={<ReferenceWorkspace />} />
              <Route path="/deal/:dealId" element={<ReferenceWorkspace />} />
              <Route path="/portfolio" element={<LegacyWorkspaceLink />} />
              <Route path="/action-hub" element={<LegacyWorkspaceLink />} />
              <Route path="/history" element={<ReferenceHistory />} />
              <Route path="/deal-gps" element={<LegacyWorkspaceLink />} />
              <Route path="/calendar" element={<LegacyWorkspaceLink />} />
              <Route path="/assets" element={<LegacyWorkspaceLink />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
        </EventPopupProvider>
      </StakeholderPopupProvider>
    </TooltipProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
