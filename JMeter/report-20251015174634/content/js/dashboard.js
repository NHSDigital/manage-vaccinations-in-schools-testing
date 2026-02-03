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

    var data = {"OkPercent": 99.91551675584343, "KoPercent": 0.08448324415657561};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.4472804151451086, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.14149704530531845, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.13033635187580853, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [1.0, 500, 1500, "Get Next Patient from STS"], "isController": false}, {"data": [0.0, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.0, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.7987921169739352, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.7596702599873177, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.41535556954059155, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.4444444444444444, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.35394321766561515, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [0.48997412677878394, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.49372253609541744, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.37933207309388783, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.6627612412919569, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.5088495575221239, 500, 1500, "2.1 Open session"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 21306, 18, 0.08448324415657561, 846.5278794705722, 0, 5064, 786.5, 1608.0, 1779.9500000000007, 2275.9600000000064, 5.917148260029033, 1997.1396744221504, 21.21700721536048], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["4.3 Vaccination confirm", 1523, 0, 0.0, 1722.40183847669, 1187, 5064, 1632.0, 2173.0, 2444.8, 3385.3199999999997, 0.4405765506819246, 172.416848713212, 2.285334068055481], "isController": false}, {"data": ["4.1 Vaccination questions", 1546, 0, 0.0, 1576.9948253557554, 649, 3428, 1535.0, 1752.0, 1866.5999999999995, 2253.909999999999, 0.441702296651948, 169.00861937542052, 2.1955891219559756], "isController": false}, {"data": ["Get Next Patient from STS", 1585, 0, 0.0, 0.6208201892744495, 0, 7, 1.0, 1.0, 1.0, 1.0, 0.4422598389560324, 0.18596363535913452, 0.28234665529486874], "isController": false}, {"data": ["2.0 Register attendance", 1577, 18, 1.14140773620799, 3129.996195307546, 1720, 5567, 3157.0, 3942.0, 4226.499999999998, 4884.320000000003, 0.44239508265382066, 795.9309005754748, 7.699989299989733], "isController": true}, {"data": ["1.0 Login", 1587, 0, 0.0, 4064.736609955892, 2308, 6446, 4036.0, 4556.2, 4837.4, 5514.279999999995, 0.4420605425171991, 714.4484683551888, 7.347481844389676], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 384, 0, 0.0, 4309.088541666669, 2567, 6688, 4187.0, 4932.5, 5300.0, 6549.6, 0.11051253353148845, 127.54466592073705, 1.6095405619490382], "isController": true}, {"data": ["2.5 Select patient", 1573, 0, 0.0, 514.948506039416, 386, 2245, 462.0, 668.6000000000001, 771.0, 1139.78, 0.44336760952983867, 174.73996513042704, 1.5759212706984744], "isController": false}, {"data": ["2.3 Search by first/last name", 1577, 0, 0.0, 526.0259987317697, 370, 2066, 480.0, 697.6000000000001, 800.0, 1119.3200000000002, 0.4425238168731497, 174.4949930636426, 1.6362470272754057], "isController": false}, {"data": ["4.0 Vaccination for flu", 395, 0, 0.0, 4237.812658227844, 2453, 6821, 4191.0, 4747.6, 4988.2, 5820.160000000001, 0.11273780184119382, 129.84582960662357, 1.6372116489901405], "isController": true}, {"data": ["4.0 Vaccination for hpv", 380, 0, 0.0, 4306.207894736841, 2469, 6322, 4200.0, 4930.400000000001, 5185.349999999999, 5984.94, 0.1094245965183973, 126.10899770111162, 1.5957206235992574], "isController": true}, {"data": ["1.2 Sign-in page", 1589, 0, 0.0, 909.772183763374, 259, 3154, 713.0, 1581.0, 1653.0, 1921.7999999999984, 0.44210965042732164, 172.39131808739026, 1.8887742136068497], "isController": false}, {"data": ["2.4 Patient attending session", 864, 18, 2.0833333333333335, 1140.5960648148152, 383, 3494, 1066.5, 1468.0, 1673.5, 2189.1000000000004, 0.2429897184975361, 95.95252194861231, 1.060637861018318], "isController": false}, {"data": ["Debug Sampler", 1577, 0, 0.0, 0.44958782498414745, 0, 3, 0.0, 1.0, 1.0, 1.0, 0.4436345059312555, 2.784314705741902, 0.0], "isController": false}, {"data": ["1.4 Open Sessions list", 1585, 0, 0.0, 1235.1022082018899, 601, 2950, 1072.0, 1847.4, 1960.499999999999, 2326.14, 0.4421602751492256, 197.65341534029048, 1.5711626952270124], "isController": false}, {"data": ["4.2 Vaccination batch", 1546, 0, 0.0, 1018.3900388098311, 626, 2602, 1011.5, 1201.6, 1349.2999999999997, 1754.3799999999987, 0.4417435670021556, 170.18610010363545, 1.9777516323939186], "isController": false}, {"data": ["1.1 Homepage", 1593, 0, 0.0, 855.8424356559958, 593, 2806, 800.0, 1130.0, 1199.8999999999999, 1539.2399999999998, 0.44241139482898006, 172.31786187969368, 1.8818247182300434], "isController": false}, {"data": ["1.3 Sign-in", 1587, 0, 0.0, 1066.0491493383722, 517, 3145, 946.0, 1597.2, 1686.3999999999996, 2174.1599999999953, 0.44218777906660206, 172.58851610587834, 2.010431881818977], "isController": false}, {"data": ["2.2 Session register", 1579, 0, 0.0, 580.8847371754268, 369, 1528, 539.0, 793.0, 883.0, 1142.0, 0.4416002541648581, 177.31891768757592, 1.5767806375733018], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 386, 0, 0.0, 4322.253886010362, 2371, 7840, 4206.5, 4950.6, 5190.75, 6475.989999999999, 0.11203473657324635, 129.5492354663228, 1.6330713059556912], "isController": true}, {"data": ["2.1 Open session", 1582, 0, 0.0, 883.726927939318, 397, 2783, 810.0, 1331.0, 1571.85, 2006.5300000000007, 0.44172546566854953, 170.99540878932808, 1.5733492098782325], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 18, 100.0, 0.08448324415657561], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 21306, 18, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 18, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 864, 18, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 18, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
