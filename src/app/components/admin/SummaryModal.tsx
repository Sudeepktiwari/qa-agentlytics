import React from "react";

export interface CrawledPage {
  _id: string;
  url: string;
  title?: string;
  hasStructuredSummary: boolean;
  structuredSummary?: {
    pageType: string;
    keyFeatures: string[];
    targetCustomers: string[];
    painPointsAddressed: string[];
    competitiveAdvantages: string[];
    businessIntelligence: string;
  };
}

interface SummaryModalProps {
  page: CrawledPage | null;
  isOpen: boolean;
  onClose: () => void;
}

const SummaryModal: React.FC<SummaryModalProps> = ({
  page,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !page) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "20px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "20px",
          padding: "0",
          maxWidth: "800px",
          width: "100%",
          maxHeight: "90vh",
          overflow: "auto",
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.15)",
          border: "1px solid #e2e8f0",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            padding: "24px 32px",
            borderRadius: "20px 20px 0 0",
            color: "white",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: "16px",
            }}
          >
            <div style={{ flex: 1 }}>
              <h2
                style={{
                  margin: "0 0 8px 0",
                  fontSize: "24px",
                  fontWeight: "700",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <span style={{ fontSize: "28px" }}>📊</span>
                Business Intelligence Summary
              </h2>
              <div
                style={{
                  fontSize: "14px",
                  opacity: 0.9,
                  wordBreak: "break-all",
                  fontFamily: "monospace",
                  background: "rgba(255, 255, 255, 0.1)",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  marginTop: "8px",
                }}
              >
                {page.url}
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                background: "rgba(255, 255, 255, 0.2)",
                color: "white",
                border: "none",
                borderRadius: "50%",
                width: "40px",
                height: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontSize: "18px",
                fontWeight: "bold",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                const target = e.target as HTMLButtonElement;
                target.style.background = "rgba(255, 255, 255, 0.3)";
                target.style.transform = "scale(1.1)";
              }}
              onMouseLeave={(e) => {
                const target = e.target as HTMLButtonElement;
                target.style.background = "rgba(255, 255, 255, 0.2)";
                target.style.transform = "scale(1)";
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: "32px" }}>
          {!page.hasStructuredSummary || !page.structuredSummary ? (
            <div
              style={{
                textAlign: "center",
                padding: "40px 20px",
                color: "#718096",
              }}
            >
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>📝</div>
              <h3 style={{ margin: "0 0 8px 0", color: "#4a5568" }}>
                No Summary Available
              </h3>
              <p style={{ margin: 0, fontSize: "16px" }}>
                This page doesn't have a structured summary yet. Use the
                "Generate Summary" button to create one.
              </p>
            </div>
          ) : (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "24px" }}
            >
              {/* Page Type */}
              <div
                style={{
                  background: "linear-gradient(135deg, #f7fafc, #edf2f7)",
                  borderRadius: "16px",
                  padding: "20px",
                  border: "1px solid #e2e8f0",
                }}
              >
                <h3
                  style={{
                    margin: "0 0 12px 0",
                    color: "#4a5568",
                    fontSize: "18px",
                    fontWeight: "600",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  🎯 Page Type
                </h3>
                <p
                  style={{
                    margin: 0,
                    color: "#2d3748",
                    fontSize: "16px",
                    fontWeight: "500",
                  }}
                >
                  {page.structuredSummary.pageType}
                </p>
              </div>

              {/* Grid Layout for Features and Customers */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
                  gap: "24px",
                }}
              >
                {/* Key Features */}
                <div
                  style={{
                    background: "linear-gradient(135deg, #e6fffa, #b2f5ea)",
                    borderRadius: "16px",
                    padding: "20px",
                    border: "1px solid #81e6d9",
                  }}
                >
                  <h3
                    style={{
                      margin: "0 0 16px 0",
                      color: "#234e52",
                      fontSize: "18px",
                      fontWeight: "600",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    ⭐ Key Features
                  </h3>
                  <ul
                    style={{ margin: 0, paddingLeft: "20px", color: "#234e52" }}
                  >
                    {page.structuredSummary.keyFeatures.map(
                      (feature, index) => (
                        <li
                          key={index}
                          style={{ marginBottom: "8px", fontSize: "14px" }}
                        >
                          {feature}
                        </li>
                      )
                    )}
                  </ul>
                </div>

                {/* Target Customers */}
                <div
                  style={{
                    background: "linear-gradient(135deg, #fef5e7, #fbd38d)",
                    borderRadius: "16px",
                    padding: "20px",
                    border: "1px solid #f6ad55",
                  }}
                >
                  <h3
                    style={{
                      margin: "0 0 16px 0",
                      color: "#7b341e",
                      fontSize: "18px",
                      fontWeight: "600",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    👥 Target Customers
                  </h3>
                  <ul
                    style={{ margin: 0, paddingLeft: "20px", color: "#7b341e" }}
                  >
                    {page.structuredSummary.targetCustomers.map(
                      (customer, index) => (
                        <li
                          key={index}
                          style={{ marginBottom: "8px", fontSize: "14px" }}
                        >
                          {customer}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              </div>

              {/* Grid Layout for Pain Points and Advantages */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
                  gap: "24px",
                }}
              >
                {/* Pain Points */}
                <div
                  style={{
                    background: "linear-gradient(135deg, #fed7d7, #feb2b2)",
                    borderRadius: "16px",
                    padding: "20px",
                    border: "1px solid #fc8181",
                  }}
                >
                  <h3
                    style={{
                      margin: "0 0 16px 0",
                      color: "#742a2a",
                      fontSize: "18px",
                      fontWeight: "600",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    🎯 Pain Points Addressed
                  </h3>
                  <ul
                    style={{ margin: 0, paddingLeft: "20px", color: "#742a2a" }}
                  >
                    {page.structuredSummary.painPointsAddressed.map(
                      (pain, index) => (
                        <li
                          key={index}
                          style={{ marginBottom: "8px", fontSize: "14px" }}
                        >
                          {pain}
                        </li>
                      )
                    )}
                  </ul>
                </div>

                {/* Competitive Advantages */}
                <div
                  style={{
                    background: "linear-gradient(135deg, #e6fffa, #9ae6b4)",
                    borderRadius: "16px",
                    padding: "20px",
                    border: "1px solid #68d391",
                  }}
                >
                  <h3
                    style={{
                      margin: "0 0 16px 0",
                      color: "#22543d",
                      fontSize: "18px",
                      fontWeight: "600",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    🏆 Competitive Advantages
                  </h3>
                  <ul
                    style={{ margin: 0, paddingLeft: "20px", color: "#22543d" }}
                  >
                    {page.structuredSummary.competitiveAdvantages.map(
                      (advantage, index) => (
                        <li
                          key={index}
                          style={{ marginBottom: "8px", fontSize: "14px" }}
                        >
                          {advantage}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              </div>

              {/* Business Intelligence */}
              <div
                style={{
                  background: "linear-gradient(135deg, #e9d8fd, #d6bcfa)",
                  borderRadius: "16px",
                  padding: "24px",
                  border: "1px solid #b794f6",
                }}
              >
                <h3
                  style={{
                    margin: "0 0 16px 0",
                    color: "#553c9a",
                    fontSize: "18px",
                    fontWeight: "600",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  🧠 Business Intelligence
                </h3>
                <p
                  style={{
                    margin: 0,
                    color: "#553c9a",
                    fontSize: "14px",
                    lineHeight: "1.6",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {page.structuredSummary.businessIntelligence}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "24px 32px",
            borderTop: "1px solid #e2e8f0",
            background: "#f8fafc",
            borderRadius: "0 0 20px 20px",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <button
            onClick={onClose}
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              border: "none",
              borderRadius: "12px",
              padding: "12px 24px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.2s ease",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
            onMouseEnter={(e) => {
              const target = e.target as HTMLButtonElement;
              target.style.transform = "translateY(-2px)";
              target.style.boxShadow = "0 8px 25px rgba(102, 126, 234, 0.4)";
            }}
            onMouseLeave={(e) => {
              const target = e.target as HTMLButtonElement;
              target.style.transform = "translateY(0)";
              target.style.boxShadow = "0 4px 12px rgba(102, 126, 234, 0.3)";
            }}
          >
            ✓ Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SummaryModal;
