var React = require("react");
var Router = require("react-router");

var api = require("../../api");
var BarChart = require("../../components/barChart");
var LoadingError = require("../../components/loadingError");
var LoadingIndicator = require("../../components/loadingIndicator");
var RouteMixin = require("../../mixins/routeMixin");
var ProjectState = require("../../mixins/projectState");

var ProjectChart = React.createClass({
  mixins: [
    RouteMixin,
    ProjectState,
  ],

  contextTypes: {
    router: React.PropTypes.func
  },

  getInitialState() {
    return {
      loading: true,
      error: false,
      stats: []
    };
  },

  getStatsEndpoint() {
    var org = this.getOrganization();
    var project = this.getProject();
    if (org && project) {
      return "/projects/" + org.slug + "/" + project.slug + "/stats/?resolution=1h";
    }
  },

  componentWillMount() {
    this.fetchData();
  },

  routeDidChange(nextPath, nextParams) {
    var router = this.context.router;
    var params = router.getCurrentParams();
    if (params.orgId != nextParams.orgId || nextParams.projectId != params.projectId) {
      this.fetchData();
    }
  },

  fetchData() {
    var endpoint = this.getStatsEndpoint();
    if (!endpoint) {
      return;
    }

    this.setState({
      error: false,
      loading: true
    });

    api.request(endpoint, {
      query: {
        since: (new Date().getTime() / 1000) - (3600 * 24 * 7)
      },
      success: (data) => {
        this.setState({
          stats: data,
          loading: false,
          error: false
        });
      },
      error: () => {
        this.setState({
          loading: false,
          error: true
        });
      }
    });
  },

  render() {
    var points = this.state.stats.map((point) => {
      return {x: point[0], y: point[1]};
    });

    return (
      <div className="bar-chart team-chart">
        <h6>Last 7 days</h6>

        {this.state.loading ?
          <LoadingIndicator />
        : (this.state.error ?
          <LoadingError onRetry={this.fetchData} />
        :
          <BarChart points={points} className="sparkline" />
        )}
      </div>
    );
  }
});

module.exports = ProjectChart;
