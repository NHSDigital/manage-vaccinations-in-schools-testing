/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 99.72454550007512, "KoPercent": 0.27545449992487603};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.3705632874907354, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0678391959798995, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.32627422828427854, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [1.0, 500, 1500, "Get Next Patient from STS"], "isController": false}, {"data": [0.0, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.0, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.5908111988513999, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.6625987078248384, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.4911937377690802, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.20466321243523317, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [0.006196999347684279, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [0.39842067480258436, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.40574037834311805, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.428897586431833, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.6044508255563532, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.07358219669777459, 500, 1500, "2.1 Open session"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 19967, 55, 0.27545449992487603, 1553.2078930234848, 0, 19790, 1035.0, 3364.0, 5042.199999999997, 9964.879999999997, 9.587788018986386, 2524.1884858918115, 34.48440405474432], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["4.3 Vaccination confirm", 1393, 0, 0.0, 3153.7415649676923, 988, 19790, 2384.0, 6027.000000000002, 7692.799999999999, 13204.939999999973, 0.7217261326515017, 207.49303001439048, 3.743684633236965], "isController": false}, {"data": ["4.1 Vaccination questions", 1393, 0, 0.0, 1787.139267767409, 412, 14719, 1347.0, 3199.800000000002, 4493.5999999999985, 9065.139999999996, 0.7222960822826423, 209.88870951214165, 3.5883243129502036], "isController": false}, {"data": ["Get Next Patient from STS", 1533, 0, 0.0, 0.5009784735812142, 0, 8, 0.0, 1.0, 1.0, 1.0, 0.741141473899782, 0.30407256756449696, 0.473165862192164], "isController": false}, {"data": ["2.0 Register attendance", 1393, 55, 3.9483129935391243, 8613.045226130665, 1807, 30479, 6950.0, 16045.400000000007, 19743.1, 26089.15999999999, 0.7237318586452447, 1094.5802023804374, 13.484753617327948], "isController": true}, {"data": ["1.0 Login", 1533, 0, 0.0, 6589.947814742341, 3031, 29357, 5382.0, 10627.400000000003, 14033.299999999997, 20219.060000000005, 0.7401224074593524, 931.4832107510625, 12.25934432828098], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 348, 0, 0.0, 6194.209770114945, 2784, 28923, 5043.5, 10110.400000000001, 12209.950000000003, 22640.459999999955, 0.18094616123758855, 160.661646776942, 2.6489820933495007], "isController": true}, {"data": ["2.5 Select patient", 1393, 0, 0.0, 1035.5491744436492, 270, 12083, 629.0, 2120.8, 3340.699999999998, 6877.9999999999945, 0.7203984998334757, 223.25645313085033, 2.5606162951309233], "isController": false}, {"data": ["2.3 Search by first/last name", 1393, 0, 0.0, 842.8880114860013, 273, 10423, 543.0, 1480.8000000000004, 2382.8999999999996, 6215.739999999998, 0.723443194907957, 227.22346900782077, 2.6749807535156847], "isController": false}, {"data": ["4.0 Vaccination for flu", 348, 0, 0.0, 6330.813218390799, 2710, 32613, 5020.5, 11119.000000000007, 14223.800000000005, 22086.0, 0.18059243660193536, 157.9994806143036, 2.638162214431723], "isController": true}, {"data": ["4.0 Vaccination for hpv", 348, 0, 0.0, 6571.626436781609, 2669, 28941, 4961.0, 11312.300000000001, 17478.75000000001, 23089.10999999999, 0.18117083212075558, 156.81876492999933, 2.6508130854538043], "isController": true}, {"data": ["1.2 Sign-in page", 1533, 0, 0.0, 1229.7984344422707, 182, 13228, 839.0, 2411.4000000000015, 3620.899999999998, 6892.20000000001, 0.7414160417669207, 221.33245242066533, 3.139484560482477], "isController": false}, {"data": ["Debug Sampler", 1393, 0, 0.0, 0.486719310839914, 0, 8, 0.0, 1.0, 1.0, 1.0, 0.7205837090145384, 4.388970139648658, 0.0], "isController": false}, {"data": ["2.4 Patient attending session", 1158, 55, 4.7495682210708114, 2253.100172711575, 307, 17360, 1600.5, 4553.0, 6033.449999999997, 9586.350000000019, 0.666972314313295, 199.4484132120995, 2.898553665784666], "isController": false}, {"data": ["1.4 Open Sessions list", 1533, 0, 0.0, 2599.242661448144, 1432, 12313, 2221.0, 4061.000000000001, 5080.199999999999, 7512.280000000001, 0.7405382113852557, 263.84827004410624, 2.6296047729028227], "isController": false}, {"data": ["4.2 Vaccination batch", 1393, 0, 0.0, 1457.1708542713552, 413, 15284, 1061.0, 2608.6000000000013, 4146.099999999995, 8503.699999999995, 0.7231127173361214, 215.57159549136884, 3.2354162873417898], "isController": false}, {"data": ["1.1 Homepage", 1533, 0, 0.0, 1438.602087410306, 420, 14189, 981.0, 2839.2000000000016, 4260.699999999998, 7785.280000000017, 0.7414475978403706, 224.04741739213338, 3.117029846409589], "isController": false}, {"data": ["1.3 Sign-in", 1533, 0, 0.0, 1322.304631441616, 363, 13012, 956.0, 2308.8, 3585.699999999997, 7061.800000000015, 0.7409766875103618, 223.4474583469477, 3.389658509981918], "isController": false}, {"data": ["2.2 Session register", 1393, 0, 0.0, 946.0617372577166, 275, 12484, 595.0, 1796.4000000000005, 2838.2, 6574.879999999981, 0.7235130845237798, 236.42533144839476, 2.5821843123937844], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 349, 0, 0.0, 6495.277936962748, 2751, 27253, 5212.0, 11080.0, 14428.0, 23782.5, 0.18277150733599792, 160.18276336542831, 2.6753817646405738], "isController": true}, {"data": ["2.1 Open session", 1393, 0, 0.0, 3914.546302943292, 672, 19537, 2567.0, 8664.800000000003, 11613.1, 16931.699999999983, 0.7239353395298318, 221.91851025813259, 2.5773286077886715], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 55, 100.0, 0.27545449992487603], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 19967, 55, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 55, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 1158, 55, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 55, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
