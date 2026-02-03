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

    var data = {"OkPercent": 100.0, "KoPercent": 0.0};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.6841216216216216, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.95, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [1.0, 500, 1500, "1.4 Select Organisations"], "isController": false}, {"data": [0.8833333333333333, 500, 1500, "2.5 Select menacwy"], "isController": false}, {"data": [0.875, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.9259259259259259, 500, 1500, "2.5 Select td_ipv"], "isController": false}, {"data": [0.22093023255813954, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.08139534883720931, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [1.0, 500, 1500, "Select Organisations"], "isController": true}, {"data": [1.0, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.46825396825396826, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Logout"], "isController": false}, {"data": [1.0, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.7, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.18518518518518517, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.4357142857142857, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.4889705882352941, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.7097902097902098, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [1.0, 500, 1500, "Homepage"], "isController": true}, {"data": [1.0, 500, 1500, "Sign In Page"], "isController": true}, {"data": [0.32857142857142857, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.1111111111111111, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [1.0, 500, 1500, "Calculate site depending on vaccination"], "isController": false}, {"data": [1.0, 500, 1500, "Login"], "isController": true}, {"data": [1.0, 500, 1500, "Calculate slug from API"], "isController": true}, {"data": [0.7441860465116279, 500, 1500, "2.5 Select hpv"], "isController": false}, {"data": [0.9166666666666666, 500, 1500, "2.5 Select flu"], "isController": false}, {"data": [1.0, 500, 1500, "1.5 Open Sessions list"], "isController": false}, {"data": [0.9357142857142857, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [1.0, 500, 1500, "Log name and address"], "isController": false}, {"data": [0.6428571428571429, 500, 1500, "2.2 Session register"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 1236, 0, 0.0, 444.173948220065, 0, 3347, 344.5, 867.3, 1070.7499999999993, 1874.8699999999824, 2.046615137003994, 43.845132714857336, 2.3358805676500687], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["2.0 Register attendance", 64, 0, 0.0, 3276.875, 1988, 6363, 2931.5, 4749.0, 5273.75, 6363.0, 0.12328199793887909, 25.1871559029684, 0.5246670844289058], "isController": true}, {"data": ["2.5 Select patient", 60, 0, 0.0, 292.1499999999999, 175, 2115, 200.5, 350.4, 572.1499999999997, 2115.0, 0.11793820431221387, 3.2762730231345616, 0.08177355963053892], "isController": false}, {"data": ["1.4 Select Organisations", 35, 0, 0.0, 282.3142857142857, 257, 344, 279.0, 311.2, 323.9999999999999, 344.0, 0.5286210542214167, 7.594797802446761, 0.7640226174293914], "isController": false}, {"data": ["2.5 Select menacwy", 30, 0, 0.0, 303.46666666666675, 174, 627, 243.0, 570.9, 605.55, 627.0, 0.10194615204249116, 2.576688992873964, 0.07108354742025262], "isController": false}, {"data": ["2.3 Search by first/last name", 68, 0, 0.0, 462.3676470588234, 289, 1636, 361.0, 766.8000000000001, 983.2999999999996, 1636.0, 0.12920436710760824, 4.952817991185602, 0.11138940949329088], "isController": false}, {"data": ["2.5 Select td_ipv", 27, 0, 0.0, 274.11111111111114, 176, 633, 241.0, 517.0, 589.7999999999997, 633.0, 0.2178912964532139, 5.5782394307589875, 0.15171532653431788], "isController": false}, {"data": ["4.0 Vaccination for flu", 43, 0, 0.0, 1597.1395348837216, 1360, 2783, 1519.0, 1963.8000000000002, 2159.6, 2783.0, 0.1300728407908429, 7.117949078373424, 0.7834147296904871], "isController": true}, {"data": ["4.0 Vaccination for hpv", 43, 0, 0.0, 1568.3023255813953, 654, 2346, 1582.0, 1748.6000000000001, 2145.799999999999, 2346.0, 0.12651449620750732, 6.411818568650296, 0.7522544129286046], "isController": true}, {"data": ["Select Organisations", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["1.2 Sign-in page", 35, 0, 0.0, 121.05714285714288, 110, 135, 121.0, 124.8, 135.0, 135.0, 0.5933812559338126, 3.5759333304370675, 0.35753538565543197], "isController": false}, {"data": ["2.4 Patient attending session", 63, 0, 0.0, 711.1111111111109, 495, 2670, 582.0, 886.0000000000002, 2007.399999999999, 2670.0, 0.12179537989525596, 4.393144551300021, 0.1810278986333785], "isController": false}, {"data": ["Logout", 1, 0, 0.0, 376.0, 376, 376, 376.0, 376.0, 376.0, 376.0, 2.6595744680851063, 16.67947972074468, 5.623026097074468], "isController": false}, {"data": ["1.1 Homepage", 35, 0, 0.0, 357.22857142857146, 340, 412, 355.0, 369.6, 381.59999999999985, 412.0, 0.5991098938719617, 3.092085731555974, 0.3247128819325573], "isController": false}, {"data": ["1.3 Sign-in", 35, 0, 0.0, 564.6285714285715, 460, 998, 522.0, 738.4, 911.5999999999996, 998.0, 0.5212599597885174, 5.058359590252439, 0.8200681593938491], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 27, 0, 0.0, 1533.148148148148, 953, 1680, 1534.0, 1646.3999999999999, 1678.4, 1680.0, 0.21713081729648007, 12.143155616953091, 1.308510032750565], "isController": true}, {"data": ["2.1 Open session", 70, 0, 0.0, 1036.8571428571427, 502, 2396, 879.0, 1594.3, 1950.650000000001, 2396.0, 0.13050522300546072, 2.276759018143955, 0.08264905968656375], "isController": false}, {"data": ["4.3 Vaccination confirm", 136, 0, 0.0, 782.1985294117652, 535, 1698, 726.5, 1069.4, 1140.3500000000008, 1664.3299999999995, 0.3333766396124987, 7.049437488203124, 0.7759844952285468], "isController": false}, {"data": ["4.1 Vaccination questions", 143, 0, 0.0, 468.1048951048951, 287, 1758, 531.0, 572.6, 587.9999999999999, 1311.8400000000024, 0.30872260086917286, 3.7018439799902416, 0.6633471116086175], "isController": false}, {"data": ["Homepage", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["Sign In Page", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["1.0 Login", 35, 0, 0.0, 1492.8571428571424, 1341, 1956, 1438.0, 1686.6, 1844.7999999999995, 1956.0, 0.5887003178981717, 27.203818693968344, 2.802650439212487], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 27, 0, 0.0, 1635.3703703703704, 1374, 2261, 1641.0, 1838.5999999999997, 2233.7999999999997, 2261.0, 0.21389696503972938, 11.424270324172733, 1.3079681818361866], "isController": true}, {"data": ["Calculate site depending on vaccination", 154, 0, 0.0, 0.383116883116883, 0, 14, 0.0, 1.0, 1.0, 6.849999999999852, 0.31545935183345386, 0.0, 0.0], "isController": false}, {"data": ["Login", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["Calculate slug from API", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["2.5 Select hpv", 43, 0, 0.0, 397.7906976744187, 179, 728, 510.0, 582.6, 588.8, 728.0, 0.1266878205864762, 3.043873990180221, 0.09439727256589978], "isController": false}, {"data": ["2.5 Select flu", 54, 0, 0.0, 333.8518518518519, 176, 1976, 245.0, 538.5, 1103.75, 1976.0, 0.11027925157147934, 2.6264335185871595, 0.07646315294506868], "isController": false}, {"data": ["1.5 Open Sessions list", 36, 0, 0.0, 166.94444444444449, 142, 492, 156.5, 177.50000000000006, 252.2999999999996, 492.0, 0.3456320746565282, 3.785076255076471, 0.20706609073322005], "isController": false}, {"data": ["4.2 Vaccination batch", 140, 0, 0.0, 355.12857142857143, 285, 795, 320.0, 527.5, 566.2999999999998, 735.1400000000006, 0.32025254200455217, 6.7050753772975265, 0.515015501509762], "isController": false}, {"data": ["Log name and address", 1, 0, 0.0, 84.0, 84, 84, 84.0, 84.0, 84.0, 84.0, 11.904761904761903, 0.0, 0.0], "isController": false}, {"data": ["2.2 Session register", 70, 0, 0.0, 786.614285714286, 290, 3347, 654.0, 1222.8999999999999, 2055.0000000000023, 3347.0, 0.13063991161276836, 10.800525292003531, 0.08388256043495626], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": []}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 1236, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
