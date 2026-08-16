import React from "react";
import { connect } from "react-redux";
import { Helmet, HelmetData } from "react-helmet-async";
import { Agentation } from "agentation";
import { ThemeProvider as EmotionThemeProvider } from "@emotion/react";
import { StyledEngineProvider, ThemeProvider } from "@mui/material/styles";
import { ChromatinViewerProvider } from "common/hooks/useChromatinViewerSelectedGene";
import actions from "actions";
import { RootState, AppDispatch } from "reducers";
import Controls from "common/components/Controls/Controls";
import { theme } from "util/theme";
import * as globals from "~/globals";
import DatasetSelector from "../DatasetSelector/DatasetSelector";
import DiffexNotice from "../DiffexNotice/DiffexNotice";
import Container from "../framework/container";
import Layout from "../framework/layout";
import { LayoutSkeleton } from "../framework/LayoutSkeleton/LayoutSkeleton";
import LeftSideBar from "../LeftSidebar/LeftSidebar";
import RightSideBar from "../RightSideBar/RightSideBar";
import Legend from "../Legend/Legend";
import MenuBar from "../MenuBar/MenuBar";
import GlobalHotkeys from "../GlobalHotkeys/GlobalHotkeys";
import Graph from "../Graph/Graph";
import Scatterplot from "../scatterplot/scatterplot";
import PanelEmbedding from "../PanelEmbedding/PanelEmbedding";
import BottomPanel from "../BottomPanel/BottomPanel";
import Autosave from "../Autosave";

interface StateProps {
  loading: RootState["controls"]["loading"];
  error: RootState["controls"]["error"];
  graphRenderCounter: number;
  datasetMetadata: RootState["datasetMetadata"];
  scatterplotXXaccessor: RootState["controls"]["scatterplotXXaccessor"];
  scatterplotYYaccessor: RootState["controls"]["scatterplotYYaccessor"];
  differentialExpressionLoading: RootState["differential"]["loading"];
  bottomPanelSelectedGene: RootState["controls"]["bottomPanelSelectedGene"];
}

const mapStateToProps = (state: RootState): StateProps => ({
  loading: state.controls.loading,
  error: state.controls.error,
  graphRenderCounter: state.controls.graphRenderCounter,
  datasetMetadata: state.datasetMetadata,
  scatterplotXXaccessor: state.controls.scatterplotXXaccessor,
  scatterplotYYaccessor: state.controls.scatterplotYYaccessor,
  differentialExpressionLoading: state.differential.loading,
  bottomPanelSelectedGene: state.controls.bottomPanelSelectedGene,
});

class App extends React.Component<StateProps & { dispatch: AppDispatch }> {
  componentDidMount(): void {
    const { dispatch } = this.props;
    dispatch(actions.doInitialDataLoad());
    dispatch(actions.checkExplainNewTab());
    this.forceUpdate();
  }

  render(): JSX.Element {
    const {
      loading,
      error,
      graphRenderCounter,
      datasetMetadata,
      differentialExpressionLoading,
      scatterplotXXaccessor,
      scatterplotYYaccessor,
      bottomPanelSelectedGene,
    } = this.props;

    const isPublished =
      datasetMetadata?.datasetMetadata?.collection_datasets[0]?.published;
    const helmetData = new HelmetData({});

    return (
      <Container>
        <Helmet helmetData={helmetData} prioritizeSeoTags>
          {!isPublished && <meta name="robots" content="noindex" />}
        </Helmet>
        <StyledEngineProvider injectFirst>
          <EmotionThemeProvider theme={theme}>
            <ThemeProvider theme={theme}>
              <ChromatinViewerProvider
                initialSelectedGene={bottomPanelSelectedGene}
              >
                {loading ? <LayoutSkeleton /> : null}
                {error ? (
                  <div
                    style={{
                      alignItems: "center",
                      background: globals.surfaceSecondary,
                      display: "flex",
                      height: "100vh",
                      justifyContent: "center",
                      left: 0,
                      position: "fixed",
                      top: 0,
                      width: "100vw",
                    }}
                  >
                    <div
                      style={{
                        background: globals.surface,
                        border: `1px solid ${globals.borderStrong}`,
                        maxWidth: 420,
                        padding: "18px 22px",
                      }}
                    >
                      <div
                        style={{
                          color: "#c23030",
                          fontFamily: globals.fontMonoCaps,
                          fontSize: 10,
                          fontWeight: globals.bolder,
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                        }}
                      >
                        Load error
                      </div>
                      <div
                        style={{
                          color: globals.fgPrimary,
                          fontFamily: globals.fontHead,
                          fontSize: 16,
                          fontWeight: 650,
                          margin: "6px 0 8px",
                        }}
                      >
                        error loading cellxgene
                      </div>
                      <div
                        style={{
                          color: globals.fgSecondary,
                          fontFamily: globals.fontBody,
                          fontSize: 12,
                          lineHeight: 1.5,
                        }}
                      >
                        The data API did not return a usable dataset. Check that
                        the server is running and that the dataset path in the
                        URL is correct, then reload.
                      </div>
                    </div>
                  </div>
                ) : null}
                {loading || error ? null : (
                  <>
                    <Layout
                      addTopPadding={false}
                      renderGraph={(viewportRef: HTMLDivElement) => (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            height: "100%",
                          }}
                        >
                          <GlobalHotkeys />
                          <Controls>
                            <MenuBar />
                          </Controls>
                          <Legend />
                          <div
                            style={{
                              flex: 1,
                              position: "relative",
                            }}
                          >
                            <Graph
                              viewportRef={viewportRef}
                              key={graphRenderCounter}
                            />
                            {scatterplotXXaccessor && scatterplotYYaccessor && (
                              <Scatterplot />
                            )}
                            <PanelEmbedding />
                            <Autosave />
                          </div>
                          <Controls bottom={0}>
                            <DatasetSelector />
                          </Controls>
                        </div>
                      )}
                    >
                      <LeftSideBar />
                      <RightSideBar />
                      <BottomPanel />
                    </Layout>
                  </>
                )}
              </ChromatinViewerProvider>
            </ThemeProvider>
          </EmotionThemeProvider>
          <DiffexNotice triggerOpen={differentialExpressionLoading} />
        </StyledEngineProvider>
        {/* dev-only visual feedback toolbar; tree-shaken from prod builds */}
        {process.env.NODE_ENV === "development" && <Agentation />}
      </Container>
    );
  }
}

export default connect(mapStateToProps)(App);
