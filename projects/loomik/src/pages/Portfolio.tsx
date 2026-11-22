import ChatSidebar, { useChatWidth } from "@/components/dashboard/ChatSidebar";
import { useState, useEffect } from "react";
import { useUIStore } from "@/stores/uiStore";
import { useIsMobile } from "@/hooks/use-mobile";
import Header from "@/components/dashboard/Header";
import TabNavigation from "@/components/dashboard/TabNavigation";
import DealsTable from "@/components/dashboard/DealsTable";
import AIChatPanel from "@/components/dashboard/AIChatPanel";
import MobileBottomNav from "@/components/MobileBottomNav";
import PipelineSummary from "@/components/dashboard/PipelineSummary";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Portfolio = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { isAIPanelOpen, toggleAIPanel } = useUIStore();
  const isMobile = useIsMobile();
  const {width:chatWidth}=useChatWidth();

  useEffect(() => {
    const handleScroll = () => {
      const mainContent = document.getElementById("main-scroll");
      if (mainContent) {
        setIsScrolled(mainContent.scrollTop > 60);
      }
    };

    const mainContent = document.getElementById("main-scroll");
    mainContent?.addEventListener("scroll", handleScroll);
    return () => mainContent?.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Header - hides on scroll */}
      <div className={`transition-all duration-200 ${isScrolled ? "h-0 opacity-0 overflow-hidden" : ""}`}>
        <Header isScrolled={isScrolled} />
      </div>
      
      {/* Tab Navigation + AI Header - side by side */}
      <div className="flex border-b border-border bg-white">
        <div className="flex-1">
          <TabNavigation isScrolled={isScrolled} activeTab="Dashboard" />
        </div>
        
        {/* AI Header - collapsible toggle - ONLY tablet/desktop */}
        {!isMobile && (
          <div style={{width:isAIPanelOpen?chatWidth:48}} className="flex shrink-0 items-center gap-2 px-4 border-l border-border">
            {isAIPanelOpen && (
              <>
                <img src="/loomik/assets/loomik-icon.svg" alt="Loomik" className="h-4 md:h-5 w-auto" />
                <div className="w-2 h-2 bg-green rounded-full" />
              </>
            )}
            <button 
              onClick={toggleAIPanel}
              className="ml-auto p-1 hover:bg-muted rounded transition-colors"
            >
              {isAIPanelOpen ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>
        )}
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Main Content - scrollable, full width on mobile */}
        <main id="main-scroll" className={`flex-1 overflow-y-auto px-6 py-4 ${isMobile ? 'pb-20' : ''}`}>
          <PipelineSummary />
          <DealsTable />
        </main>

        {/* AI Chat Sidebar - ONLY tablet/desktop */}
        {!isMobile && (
          <ChatSidebar open={isAIPanelOpen}><AIChatPanel hideHeader /></ChatSidebar>
        )}
      </div>

      {/* Bottom Nav + AI Sheet - ONLY mobile */}
      {isMobile && <MobileBottomNav />}
    </div>
  );
};

export default Portfolio;
