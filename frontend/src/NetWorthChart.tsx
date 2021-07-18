import { useState, useEffect } from 'react'
import { ErrorDataItem } from './dataUtilities'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import HC3D from 'highcharts/highcharts-3d'
import darkUnica from 'highcharts/themes/dark-unica.js'
import HighchartsExporting from 'highcharts/modules/exporting'

HighchartsExporting(Highcharts)

darkUnica(Highcharts)

HC3D(Highcharts)

type Data = { accounts: { balances: { current: number }; name: string }[] }

function transformData(data: Data): [string, number][] {
  return data.accounts.map(({ balances, name }) => [
    name,
    Number(Math.round(parseFloat(balances.current + 'e2')) + 'e-2'),
  ])
}

const options = {
  title: {
    text: 'Net Worth Breakdown',
  },
  lang: {
    decimalPoint: '.',
    thousandsSep: ',',
  },
  chart: {
    type: 'pie',
    options3d: {
      enabled: true,
      alpha: 45,
    },
  },
  plotOptions: {
    pie: {
      innerSize: 100,
      depth: 45,
    },
  },
}

function NetWorthChart({ token }: { token: string }) {
  const [transformedData, setTransformedData] = useState<[string, number][]>()
  const [error, setError] = useState<ErrorDataItem | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const getData = async () => {
    setIsLoading(true)
    const response = await fetch(`/api/balance`, { method: 'GET' })
    const data = await response.json()
    if (data.error != null) {
      setError(data.error)
      setIsLoading(false)
      return
    }
    setTransformedData(transformData(data)) // transform data into proper format for each individual product
    setIsLoading(false)
  }

  useEffect(() => {
    getData()
  }, [])

  transformedData && console.log('transformedData', transformedData)

  return transformedData ? (
    <HighchartsReact
      highcharts={Highcharts}
      options={{
        ...options,
        series: [
          {
            tooltip: {
              pointFormatter(this: { y: number }) {
                return `$ ${this.y.toLocaleString()}`
              },
            },
            data: transformedData,
          },
        ],
      }}
    />
  ) : null
}

export default NetWorthChart
