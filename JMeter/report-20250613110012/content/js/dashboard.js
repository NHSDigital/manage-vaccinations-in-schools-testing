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

    var data = {"OkPercent": 81.44329896907216, "KoPercent": 18.556701030927837};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.35294117647058826, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.8071428571428572, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.0, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.0, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.2830188679245283, 500, 1500, "1.4 Select Organisations"], "isController": false}, {"data": [0.8285714285714286, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.125, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.0, 500, 1500, "2.1 Open session"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 291, 54, 18.556701030927837, 7262.333333333334, 0, 59301, 471.0, 25593.000000000007, 39533.39999999999, 50881.959999999934, 1.8980777885763112, 13.094993982897734, 1.6814305130680374], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["1.2 Sign-in page", 70, 2, 2.857142857142857, 1940.7571428571432, 152, 37216, 157.0, 3858.8999999999996, 11211.800000000017, 37216.0, 0.6989934494328168, 4.1092584490833195, 0.42117085771489055], "isController": false}, {"data": ["2.0 Register attendance", 30, 30, 100.0, 0.49999999999999994, -1, 2, 0.5, 1.0, 1.4499999999999993, 2.0, 0.5143944719740746, 0.5947686082200236, 0.0], "isController": true}, {"data": ["1.0 Login", 70, 70, 100.0, 50464.0, 7539, 109166, 50606.0, 71392.2, 79445.7, 109166.0, 0.5218117303276978, 14.707228676536364, 1.9216474062229776], "isController": true}, {"data": ["1.4 Select Organisations", 53, 7, 13.20754716981132, 13507.075471698114, 420, 59301, 9618.0, 39311.00000000001, 42537.499999999985, 59301.0, 0.42376608112321995, 5.3528499143472805, 0.6021363707233607], "isController": false}, {"data": ["1.1 Homepage", 70, 0, 0.0, 1474.8857142857144, 455, 20547, 466.0, 3202.0999999999995, 9367.7, 20547.0, 0.911138011376209, 4.707842986515158, 0.49382968390019133], "isController": false}, {"data": ["1.3 Sign-in", 68, 15, 22.058823529411764, 17034.838235294115, 549, 54665, 11541.5, 41686.5, 48161.549999999996, 54665.0, 0.5769752918816182, 4.4992422559097545, 0.8685122098153679], "isController": false}, {"data": ["2.1 Open session", 30, 30, 100.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, 0.48556260520523115, 0.5614317622685485, 0.0], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in path at index 38: https://qa.mavistesting.com/sessions/${SessionId}", 30, 55.55555555555556, 10.309278350515465], "isController": false}, {"data": ["502/Bad Gateway", 24, 44.44444444444444, 8.24742268041237], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 291, 54, "Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in path at index 38: https://qa.mavistesting.com/sessions/${SessionId}", 30, "502/Bad Gateway", 24, "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["1.2 Sign-in page", 70, 2, "502/Bad Gateway", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["1.4 Select Organisations", 53, 7, "502/Bad Gateway", 7, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["1.3 Sign-in", 68, 15, "502/Bad Gateway", 15, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["2.1 Open session", 30, 30, "Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in path at index 38: https://qa.mavistesting.com/sessions/${SessionId}", 30, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
