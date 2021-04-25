import React, { Component } from 'react'
import { connect } from 'react-redux'
import Chart from 'react-apexcharts'
import Spinner from './Spinner'
import { chartOptions, dummyData } from './priceChart.config'
import {
  priceChartLoadedSelector,
  priceChartSelector
} from '../store/selectors'


const showPriceChart = () => {
  return(
    <div className="price-chart">
      <Chart options={chartOptions} series={dummyData} type='candlestick' width='100%' height='100%' />
    </div>
  )
}

class PriceChart extends Component {
  render() {
    return(
      <div className="card bg-dark text-white">
        <div className="card-header">
          Price Chart
        </div>
        <div className="card-body">
          {showPriceChart()}
        </div>
      </div>
    )
  }
}

function mapStateToProps(state) {
  console.log({
    priceChartLoaded: priceChartLoadedSelector(state),
    priceChart: priceChartSelector(state)
  })
  return {
    priceChartLoaded: priceChartLoadedSelector(state),
    priceChart: priceChartSelector(state)
  }
}

export default connect(mapStateToProps)(PriceChart);

