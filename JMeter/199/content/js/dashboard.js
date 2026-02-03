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

    var data = {"OkPercent": 99.92009132420091, "KoPercent": 0.07990867579908675};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.7926188720973093, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.4169139465875371, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.9770029673590505, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.2655786350148368, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [1.0, 500, 1500, "Reset counters"], "isController": false}, {"data": [0.46236559139784944, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.2869318181818182, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.9844213649851632, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.0, 500, 1500, "Initialise vaccination list"], "isController": false}, {"data": [0.9903560830860534, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.3258064516129032, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.2921686746987952, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.9879032258064516, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.42783505154639173, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [0.8676075268817204, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [0.0, 500, 1500, "Reset vaccination list"], "isController": false}, {"data": [0.9829376854599406, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [1.0, 500, 1500, "Add vaccination row to STS"], "isController": false}, {"data": [0.9919354838709677, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.9737903225806451, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.9799703264094956, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.2655367231638418, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.5, 500, 1500, "Data prep Homepage"], "isController": false}, {"data": [0.8961424332344213, 500, 1500, "2.1 Open session"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 8760, 7, 0.07990867579908675, 318.76244292237413, 2, 6721, 125.0, 925.0, 1143.949999999999, 1893.1199999999953, 4.494036167756829, 1693.2429730585482, 20.309081217134796], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["4.3 Vaccination confirm", 674, 0, 0.0, 1230.9718100890223, 807, 6691, 1076.0, 1831.5, 2114.0, 3171.75, 0.382092232756529, 154.25620141203348, 2.308692399879363], "isController": false}, {"data": ["4.1 Vaccination questions", 674, 0, 0.0, 175.14391691394673, 91, 1648, 124.0, 262.0, 460.75, 1040.25, 0.3839222039185128, 151.56230819910297, 2.1953275904139637], "isController": false}, {"data": ["2.0 Register attendance", 674, 5, 0.7418397626112759, 1469.249258160238, 441, 7886, 1471.5, 2348.5, 2752.0, 3894.5, 0.38381026789273354, 715.567178546266, 7.593602645543245], "isController": true}, {"data": ["Reset counters", 1, 0, 0.0, 429.0, 429, 429, 429.0, 429.0, 429.0, 429.0, 2.331002331002331, 0.0, 0.0], "isController": false}, {"data": ["1.0 Login", 744, 0, 0.0, 957.8131720430116, 648, 2792, 845.0, 1374.0, 1666.25, 2352.55, 0.3916512997927512, 651.6468074126786, 7.511268364576825], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 176, 0, 0.0, 1532.6249999999998, 1025, 3350, 1405.5, 2212.4, 2399.350000000001, 2848.729999999993, 0.10118134974770776, 120.96403504252204, 1.7178350202161485], "isController": true}, {"data": ["2.5 Select patient", 674, 0, 0.0, 136.45548961424333, 61, 2417, 94.0, 202.5, 322.5, 958.0, 0.384373889721192, 155.80298802937665, 1.6011032402105845], "isController": false}, {"data": ["Initialise vaccination list", 1, 1, 100.0, 2.0, 2, 2, 2.0, 2.0, 2.0, 2.0, 500.0, 1247.55859375, 0.0], "isController": false}, {"data": ["2.3 Search by first/last name", 674, 0, 0.0, 126.40949554896152, 69, 3158, 93.0, 176.0, 309.5, 716.75, 0.3844361536535409, 156.0111488979972, 1.6642837628984317], "isController": false}, {"data": ["4.0 Vaccination for flu", 155, 0, 0.0, 1559.225806451613, 1052, 4364, 1381.0, 2227.8, 2658.5999999999976, 4014.5599999999986, 0.1005511500456697, 119.92900822731404, 1.7038440522210776], "isController": true}, {"data": ["4.0 Vaccination for hpv", 166, 0, 0.0, 1577.3493975903625, 1059, 4177, 1377.5, 2273.000000000001, 2700.1500000000005, 3984.0400000000036, 0.10233054739445467, 121.96584846086535, 1.7364678301809156], "isController": true}, {"data": ["1.2 Sign-in page", 744, 0, 0.0, 136.3010752688172, 13, 1466, 105.0, 224.0, 361.0, 843.749999999997, 0.39213516013503363, 157.27816478505036, 1.921606712382827], "isController": false}, {"data": ["2.4 Patient attending session", 388, 5, 1.288659793814433, 1102.8041237113412, 58, 6721, 952.5, 1671.0000000000002, 1862.2499999999993, 2724.8000000000025, 0.2210097067691058, 90.05472584650136, 1.127639460400244], "isController": false}, {"data": ["1.4 Open Sessions list", 744, 0, 0.0, 493.447580645161, 363, 2056, 435.0, 636.5, 802.0, 1583.849999999987, 0.3917022304914915, 179.87419013161772, 1.6301867023476335], "isController": false}, {"data": ["Reset vaccination list", 1, 1, 100.0, 37.0, 37, 37, 37.0, 37.0, 37.0, 37.0, 27.027027027027028, 67.43559966216216, 0.0], "isController": false}, {"data": ["4.2 Vaccination batch", 674, 0, 0.0, 164.35163204747778, 90, 1219, 115.0, 285.0, 418.25, 911.0, 0.3836964312246919, 152.1668054233555, 1.9979537761791692], "isController": false}, {"data": ["Add vaccination row to STS", 674, 0, 0.0, 44.252225519287826, 2, 56, 44.0, 48.0, 48.0, 48.0, 20.783866292515956, 5.946946116901539, 16.78610025941287], "isController": false}, {"data": ["1.1 Homepage", 744, 0, 0.0, 144.0913978494621, 27, 1512, 112.0, 225.0, 340.5, 811.0999999999945, 0.3917814365108704, 157.25617844410243, 1.9076713061369086], "isController": false}, {"data": ["1.3 Sign-in", 744, 0, 0.0, 183.97311827956983, 75, 1265, 112.5, 367.0, 544.5, 1068.4499999999982, 0.3918790442154387, 157.59955526798151, 2.0562153558712066], "isController": false}, {"data": ["2.2 Session register", 674, 0, 0.0, 155.34124629080122, 69, 3262, 96.0, 279.0, 422.25, 878.5, 0.38425949944784077, 160.2858621963267, 1.606540609608597], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 177, 0, 0.0, 1611.485875706214, 1043, 6931, 1470.0, 2211.800000000001, 2482.199999999999, 4484.139999999997, 0.1032880616507183, 123.9120504252171, 1.7533565611115196], "isController": true}, {"data": ["Data prep Homepage", 1, 0, 0.0, 683.0, 683, 683, 683.0, 683.0, 683.0, 683.0, 1.4641288433382138, 569.1958157942898, 4.827049780380674], "isController": false}, {"data": ["2.1 Open session", 674, 0, 0.0, 416.19436201780417, 168, 2646, 316.0, 697.0, 984.5, 1923.25, 0.3841756127145028, 154.25447728105695, 1.6028144595307472], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 5, 71.42857142857143, 0.05707762557077625], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:9191 [localhost/127.0.0.1] failed: Connection refused", 2, 28.571428571428573, 0.0228310502283105], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 8760, 7, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 5, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:9191 [localhost/127.0.0.1] failed: Connection refused", 2, "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Initialise vaccination list", 1, 1, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:9191 [localhost/127.0.0.1] failed: Connection refused", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 388, 5, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 5, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["Reset vaccination list", 1, 1, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:9191 [localhost/127.0.0.1] failed: Connection refused", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
