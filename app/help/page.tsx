export default function Help() {
  return (
    <div className="max-w-3xl text-black">
      <h1 className="text-2xl font-bold mb-6">Help</h1>

      <div className="flex flex-col gap-6 leading-relaxed">
        
        <p>
          This dashboard displays temperature data collected from an Arduino device
          and stored in a database. The data is visualized in a chart and summarized
          using statistical values.
        </p>

        <div>
          <h2 className="text-lg font-semibold mb-2">Filters</h2>
          <p>
            The filter buttons (1D, 1W, 1M, 1Y) allow you to control how much data is
            shown in the chart.
          </p>
          <ul className="list-disc ml-6 mt-2">
            <li><strong>1D</strong> – Shows data from the last 24 hours</li>
            <li><strong>1W</strong> – Shows data from the last 7 days</li>
            <li><strong>1M</strong> – Shows data from the last 30 days</li>
            <li><strong>1Y</strong> – Shows data from the last year</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">Chart</h2>
          <p>
            The chart visualizes temperature measurements over time. Each point
            represents a recorded value from the Arduino. You can hover over points
            to see the exact time and temperature.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">Statistics</h2>
          <p>
            Below the chart, three key values are displayed based on the selected filter:
          </p>
          <ul className="list-disc ml-6 mt-2">
            <li><strong>Min Temperature</strong> – The lowest recorded value</li>
            <li><strong>Max Temperature</strong> – The highest recorded value</li>
            <li><strong>Average Temperature</strong> – The average of all values</li>
          </ul>
        </div>

      </div>
    </div>
  )
}