#!/bin/bash

# Define colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}==================================================${NC}"
echo -e "${BLUE}🚀  LeaveManagement Test Automation Script${NC}"
echo -e "${BLUE}==================================================${NC}"

# Add dotnet tools to PATH
export PATH="$PATH:$HOME/.dotnet/tools"

# Define results directory
RESULTS_DIR="./TestResults"
REPORT_DIR="$RESULTS_DIR/CoverageReport"

echo -e "${YELLOW}Cleaning up previous results in $RESULTS_DIR...${NC}"
rm -rf "$RESULTS_DIR"
mkdir -p "$RESULTS_DIR"

# Find dotnet command
DOTNET_CMD="dotnet"
if ! command -v dotnet &> /dev/null; then
    if [ -f "/usr/local/share/dotnet/dotnet" ]; then
        DOTNET_CMD="/usr/local/share/dotnet/dotnet"
    else
        echo -e "${RED}Error: dotnet command not found in PATH and fallback not found.${NC}"
        exit 1
    fi
fi

# Find all test projects
TEST_PROJECTS=$(find src -name "*[Tt]ests.csproj")

if [ -z "$TEST_PROJECTS" ]; then
    echo -e "${RED}No test projects found in src directory.${NC}"
    exit 1
fi

echo -e "${YELLOW}Found test projects:${NC}"
for project in $TEST_PROJECTS; do
    echo -e "  - $project"
done

SETTINGS_PATH="./coverlet.runsettings"
TOTAL_PASSED=0
TOTAL_FAILED=0

echo -e "\n${BLUE}👉 Running tests sequentially...${NC}"

for project in $TEST_PROJECTS; do
    # Extract project name for the coverage file
    PROJECT_NAME=$(basename "$project" .csproj)
    
    echo -e "\n${YELLOW}--------------------------------------------------${NC}"
    echo -e "${BLUE}Testing: $PROJECT_NAME${NC}"
    echo -e "${YELLOW}--------------------------------------------------${NC}"
    
    # Run dotnet test on the project in quiet mode
    echo -n -e "  $PROJECT_NAME... "
    OUTPUT_FILE="$RESULTS_DIR/${PROJECT_NAME}_test.log"
    
    if "$DOTNET_CMD" test "$project" \
        -v q \
        --nologo \
        --settings "$SETTINGS_PATH" \
        --results-directory "$RESULTS_DIR" > "$OUTPUT_FILE" 2>&1; then
        echo -e "${GREEN}PASSED${NC}"
        TOTAL_PASSED=$((TOTAL_PASSED + 1))
    else
        echo -e "${RED}FAILED${NC}"
        TOTAL_FAILED=$((TOTAL_FAILED + 1))
        # We'll show the output later if needed, or immediately if preferred.
        # Showing immediately for a better feedback loop on failures.
        echo -e "${RED}--- Error Log: $PROJECT_NAME ---${NC}"
        cat "$OUTPUT_FILE"
        echo -e "${RED}-----------------------------------${NC}"
    fi
done

# Run ReportGenerator
echo -e "\n${BLUE}==================================================${NC}"
echo -e "${YELLOW}📊 Generating Unified Coverage Report...${NC}"
echo -e "${BLUE}==================================================${NC}"

# We search recursively for any cobertura or opencover files in TestResults
if command -v reportgenerator &> /dev/null; then
    reportgenerator \
        -reports:"$RESULTS_DIR/**/*.xml" \
        -targetdir:"$REPORT_DIR" \
        -reporttypes:"Html;TextSummary" \
        -title:"LeaveManagement Backend Test Coverage" \
        -tag:"v1.0.0" > /dev/null
    
    echo -e "\n${GREEN}✅ HTML Report generated: $REPORT_DIR/index.html${NC}"
    
    if [ -f "$REPORT_DIR/Summary.txt" ]; then
        echo -e "\n${BLUE}📊 Unified Coverage Summary:${NC}"
        grep -E "Line coverage|Branch coverage|Method coverage" "$REPORT_DIR/Summary.txt" | sed 's/^/  /'
    fi
else
    echo -e "${RED}Warning: reportgenerator tool not found in PATH.${NC}"
    echo -e "${YELLOW}Please ensure it is installed via: dotnet tool install -g dotnet-reportgenerator-globaltool${NC}"
fi

echo -e "\n${BLUE}==================================================${NC}"
echo -e "${YELLOW}Final Summary:${NC}"
echo -e "${GREEN}  Projects Passed: $TOTAL_PASSED${NC}"
if [ $TOTAL_FAILED -gt 0 ]; then
    echo -e "${RED}  Projects Failed: $TOTAL_FAILED${NC}"
fi

if [ $TOTAL_FAILED -eq 0 ]; then
    echo -e "\n${GREEN}✅ All projects completed successfully!${NC}"
else
    echo -e "\n${RED}❌ Some projects failed. Check the output above.${NC}"
    exit 1
fi

echo -e "${BLUE}==================================================${NC}"
