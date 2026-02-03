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

    var data = {"OkPercent": 99.53292321713374, "KoPercent": 0.46707678286625653};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.2441934313191798, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0021156558533145277, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.13324175824175824, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.0, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.0, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.4812332439678284, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.5830039525691699, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.36204663212435234, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.06174089068825911, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [0.0, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [0.3755186721991701, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.3658064516129032, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.32555123216601817, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.5439056356487549, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.3391927083333333, 500, 1500, "2.1 Open session"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 8778, 41, 0.46707678286625653, 2128.570858965604, 279, 23148, 1347.0, 4778.1, 6882.0999999999985, 12365.719999999972, 4.870427108382262, 1990.2359029903912, 20.456925543408], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["4.3 Vaccination confirm", 709, 0, 0.0, 4440.729196050782, 1415, 14843, 4099.0, 7070.0, 7742.5, 10030.699999999995, 0.4273676863012683, 172.41952919161653, 2.24596430635934], "isController": false}, {"data": ["4.1 Vaccination questions", 728, 0, 0.0, 1843.8887362637372, 572, 9289, 1797.0, 2349.2, 2657.449999999998, 4595.610000000003, 0.42814613898047116, 169.03472804872544, 2.152219570895237], "isController": false}, {"data": ["2.0 Register attendance", 750, 41, 5.466666666666667, 6152.917333333327, 2118, 16108, 5670.0, 9874.3, 11157.8, 13921.79, 0.4266900910044626, 811.2987307196527, 7.452015210186117], "isController": true}, {"data": ["1.0 Login", 771, 0, 0.0, 11098.619974059664, 3886, 28410, 9954.0, 17397.800000000003, 20639.8, 25423.359999999997, 0.4309795477565586, 716.5804310165806, 7.233435101418543], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 180, 0, 0.0, 7541.155555555557, 3306, 17883, 7117.0, 10343.0, 11405.449999999999, 16193.339999999995, 0.10715376386525058, 127.2666096379825, 1.5760904830194027], "isController": true}, {"data": ["2.5 Select patient", 746, 0, 0.0, 1027.2439678284184, 343, 4086, 881.0, 1784.3000000000002, 1916.65, 2905.4799999999996, 0.4282306153892077, 174.21614957353455, 1.543030884877432], "isController": false}, {"data": ["2.3 Search by first/last name", 759, 0, 0.0, 780.2358366271409, 348, 7722, 713.0, 1119.0, 1301.0, 2340.1999999999907, 0.42910350722861323, 174.8691897268578, 1.616560076575754], "isController": false}, {"data": ["4.0 Vaccination for flu", 181, 0, 0.0, 7432.6353591160205, 3251, 17503, 7182.0, 10122.2, 11436.1, 13914.68000000003, 0.10694119238838677, 127.0988103337023, 1.5727839964425805], "isController": true}, {"data": ["4.0 Vaccination for hpv", 180, 0, 0.0, 7531.883333333335, 3503, 16848, 7161.0, 10418.4, 11629.45, 14903.999999999995, 0.10636342847148073, 126.19457867543998, 1.5667277616230115], "isController": true}, {"data": ["1.2 Sign-in page", 772, 0, 0.0, 1297.2202072538864, 279, 9104, 1146.0, 2038.7, 2310.749999999996, 4299.469999999999, 0.4308723378842829, 172.9470459876339, 1.849592851453971], "isController": false}, {"data": ["2.4 Patient attending session", 494, 41, 8.299595141700404, 3301.248987854248, 542, 10968, 2937.5, 5740.5, 6857.75, 9174.25, 0.28149431313108286, 114.54755204742239, 1.2324313127521482], "isController": false}, {"data": ["1.4 Open Sessions list", 770, 0, 0.0, 7093.745454545456, 1761, 23148, 6113.5, 12629.8, 16266.949999999999, 20143.73, 0.43167556834012893, 198.03841175433652, 1.5539400696959826], "isController": false}, {"data": ["4.2 Vaccination batch", 723, 0, 0.0, 1330.5504840940532, 532, 9107, 1274.0, 1783.8000000000002, 2027.3999999999983, 3280.7199999999975, 0.42702684185595435, 169.72243695946108, 1.9357446190114358], "isController": false}, {"data": ["1.1 Homepage", 775, 0, 0.0, 1308.0890322580647, 516, 9752, 1244.0, 1773.3999999999999, 2091.3999999999996, 3376.5200000000004, 0.4305990939083841, 172.65441040427422, 1.835529559447122], "isController": false}, {"data": ["1.3 Sign-in", 771, 0, 0.0, 1408.9740596627753, 505, 8738, 1286.0, 2055.000000000001, 2299.3999999999996, 4371.71999999999, 0.43128837753339966, 173.4466871880012, 1.9984906261554864], "isController": false}, {"data": ["2.2 Session register", 763, 0, 0.0, 831.674967234601, 340, 5401, 774.0, 1189.8000000000002, 1367.1999999999998, 2283.3600000000033, 0.4300898284601093, 179.54668724084692, 1.5566133700652407], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 182, 0, 0.0, 7616.109890109891, 3192, 16344, 7424.5, 10267.9, 11412.149999999998, 16090.849999999997, 0.1077388457736182, 128.09055638215767, 1.5846526902153002], "isController": true}, {"data": ["2.1 Open session", 768, 0, 0.0, 1359.5638020833335, 515, 6873, 1272.0, 1921.1, 2247.6999999999994, 3668.3799999999947, 0.43154674106352675, 174.14281919199476, 1.5581067870979886], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 41, 100.0, 0.46707678286625653], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 8778, 41, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 41, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 494, 41, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 41, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
