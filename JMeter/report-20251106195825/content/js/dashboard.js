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

    var data = {"OkPercent": 99.78835978835978, "KoPercent": 0.21164021164021163};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.3383655224761744, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0013175230566534915, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.001910828025477707, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.0, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.0, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.8304130162703379, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.7690886699507389, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.3859223300970874, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.1745362563237774, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [0.30365853658536585, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [0.48721227621483376, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.4891041162227603, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.36479902557856275, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.6664619164619164, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.5202453987730061, 500, 1500, "2.1 Open session"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 9450, 20, 0.21164021164021163, 1118.5110052909977, 299, 6219, 932.0, 1997.0, 2300.0, 3088.959999999999, 5.243669725381525, 2143.9880998218887, 24.985773576364476], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["4.3 Vaccination confirm", 759, 0, 0.0, 2304.633728590252, 1468, 6219, 2157.0, 3069.0, 3377.0, 4499.0, 0.4524096626120667, 182.7313609612558, 2.6992392325829733], "isController": false}, {"data": ["4.1 Vaccination questions", 785, 0, 0.0, 1667.1541401273898, 551, 2908, 1603.0, 1857.1999999999998, 2001.3999999999999, 2479.979999999999, 0.455258261922547, 179.7049278553392, 2.5736590469385767], "isController": false}, {"data": ["2.0 Register attendance", 806, 19, 2.357320099255583, 3779.7270471464, 1680, 7659, 3864.0, 5026.6, 5541.6, 6546.6199999999935, 0.4587719937342902, 886.319317247415, 9.304589562709465], "isController": true}, {"data": ["1.0 Login", 821, 1, 0.1218026796589525, 4508.505481120585, 2623, 6927, 4446.0, 5211.0, 5551.0, 5975.12, 0.4585959367617988, 763.5907109422261, 8.690592760209904], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 191, 0, 0.0, 4848.979057591624, 2405, 7512, 4754.0, 5670.0, 6216.0, 7007.839999999991, 0.11359365112594502, 134.47994379753388, 1.8839509130089709], "isController": true}, {"data": ["2.5 Select patient", 799, 0, 0.0, 490.7997496871087, 353, 2061, 423.0, 683.0, 803.0, 1202.0, 0.4537349370222722, 184.530079083295, 1.8653273207420469], "isController": false}, {"data": ["2.3 Search by first/last name", 812, 0, 0.0, 524.6022167487685, 355, 1942, 454.5, 759.7, 853.7499999999995, 1129.15, 0.4589922632671092, 186.93285788342527, 1.962150966095338], "isController": false}, {"data": ["4.0 Vaccination for flu", 195, 0, 0.0, 4854.907692307696, 2393, 8859, 4736.0, 5702.0, 6225.4, 7485.239999999989, 0.11441452911967114, 135.77789161728018, 1.9014442184798241], "isController": true}, {"data": ["4.0 Vaccination for hpv", 202, 0, 0.0, 4846.727722772274, 2096, 7468, 4778.5, 5814.2, 6013.2, 7144.349999999999, 0.11827321111768184, 139.21544815282274, 1.9549295630331809], "isController": true}, {"data": ["1.2 Sign-in page", 824, 0, 0.0, 1010.0145631067951, 299, 3244, 771.0, 1771.5, 1856.75, 2207.5, 0.4591575462041212, 184.53121824224155, 2.227249525448974], "isController": false}, {"data": ["2.4 Patient attending session", 593, 19, 3.204047217537943, 1770.578414839798, 564, 4322, 1625.0, 2442.4, 2886.5, 3657.619999999993, 0.37485571531699646, 152.87252674442237, 1.882269768147315], "isController": false}, {"data": ["1.4 Open Sessions list", 820, 1, 0.12195121951219512, 1505.859756097562, 786, 3475, 1319.5, 2240.7, 2381.95, 2835.1799999999985, 0.4593806652280209, 211.14863522276042, 1.8866201731066794], "isController": false}, {"data": ["4.2 Vaccination batch", 782, 0, 0.0, 946.3644501278774, 525, 2082, 960.5, 1155.7, 1288.85, 1752.5499999999993, 0.45597800576678066, 181.19391553893016, 2.3450164031090472], "isController": false}, {"data": ["1.1 Homepage", 826, 0, 0.0, 849.2215496368042, 503, 2330, 785.0, 1334.0, 1368.0, 1672.4400000000005, 0.4587622195427152, 184.17498057480796, 2.212240738251716], "isController": false}, {"data": ["1.3 Sign-in", 821, 0, 0.0, 1144.7844092570044, 502, 2888, 1004.0, 1776.0, 1918.9, 2402.499999999999, 0.45955830904932443, 185.03197754069694, 2.379123194162546], "isController": false}, {"data": ["2.2 Session register", 814, 0, 0.0, 609.299754299755, 352, 2198, 547.5, 862.5, 1036.25, 1461.6000000000004, 0.45882005460747777, 193.6767678857386, 1.8916848500182626], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 192, 0, 0.0, 4871.536458333333, 2540, 7449, 4718.5, 5756.6, 6353.1, 7186.739999999998, 0.11424063003707466, 136.32232906373852, 1.905269653069949], "isController": true}, {"data": ["2.1 Open session", 815, 0, 0.0, 858.2920245398781, 373, 2554, 822.0, 1251.6, 1446.6, 1962.9600000000005, 0.4581413402573574, 182.88879774858665, 1.8848649266524147], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 19, 95.0, 0.20105820105820105], "isController": false}, {"data": ["Assertion failed", 1, 5.0, 0.010582010582010581], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 9450, 20, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 19, "Assertion failed", 1, "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 593, 19, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 19, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["1.4 Open Sessions list", 820, 1, "Assertion failed", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
