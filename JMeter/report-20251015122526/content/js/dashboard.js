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

    var data = {"OkPercent": 99.95894347885589, "KoPercent": 0.04105652114410839};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.5225766595529596, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.2726337448559671, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.4520547945205479, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [1.0, 500, 1500, "Get Next Patient from STS"], "isController": false}, {"data": [9.31098696461825E-4, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.0, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.8829588014981273, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.8422509225092251, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.6420863309352518, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.4454828660436137, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [0.4594594594594595, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [0.49404761904761907, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.49460431654676257, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.536036036036036, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.76007326007326, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.5054545454545455, 500, 1500, "2.1 Open session"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 7307, 3, 0.04105652114410839, 739.0013685507074, 0, 4806, 668.0, 1365.1999999999998, 1563.199999999999, 2233.2800000000007, 6.084289094908915, 2051.7885918616703, 21.693613185200697], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["4.3 Vaccination confirm", 486, 0, 0.0, 1614.7633744855973, 1052, 4806, 1469.0, 2128.9, 2591.849999999999, 4018.969999999999, 0.4582000844747481, 179.30862389009042, 2.3768457269895875], "isController": false}, {"data": ["4.1 Vaccination questions", 511, 0, 0.0, 1315.3209393346378, 593, 3001, 1245.0, 1491.8000000000002, 1787.1999999999994, 2619.8799999999997, 0.45795588567413614, 175.23364831150053, 2.274105634728202], "isController": false}, {"data": ["Get Next Patient from STS", 554, 0, 0.0, 0.7364620938628164, 0, 2, 1.0, 1.0, 1.0, 1.0, 0.4679180518392389, 0.1969228818895443, 0.2987256755461296], "isController": false}, {"data": ["2.0 Register attendance", 537, 3, 0.5586592178770949, 2959.1005586592164, 1462, 6828, 2909.0, 3902.6, 4338.0, 5283.000000000002, 0.4587171637099199, 834.8553551718545, 8.079397630473855], "isController": true}, {"data": ["1.0 Login", 555, 0, 0.0, 3428.9819819819827, 2157, 7503, 3353.0, 4040.4, 4432.4, 5897.519999999971, 0.46684241250700265, 753.3198966856187, 7.709981465357349], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 126, 0, 0.0, 3719.3650793650786, 1870, 6352, 3673.5, 4425.0, 4900.399999999999, 6012.610000000005, 0.11374530800604474, 130.20434505383943, 1.64143796017199], "isController": true}, {"data": ["2.5 Select patient", 534, 0, 0.0, 477.43258426966304, 346, 3410, 423.0, 631.0, 800.25, 1390.8499999999972, 0.4596327929922353, 181.15889971392377, 1.6337357868349633], "isController": false}, {"data": ["2.3 Search by first/last name", 542, 0, 0.0, 481.80996309963086, 333, 2022, 442.0, 649.4, 753.7500000000003, 1241.060000000003, 0.46283842925275503, 182.5685317902539, 1.7114776204917017], "isController": false}, {"data": ["4.0 Vaccination for flu", 128, 0, 0.0, 3746.335937500001, 1972, 6782, 3617.0, 4511.7, 4987.099999999999, 6666.579999999997, 0.11506217852256567, 131.56658005821876, 1.657082529358834], "isController": true}, {"data": ["4.0 Vaccination for hpv", 125, 0, 0.0, 3642.0800000000013, 1818, 6066, 3554.0, 4237.6, 4879.999999999999, 5902.719999999997, 0.11462579263735607, 131.14959138770567, 1.6575856770487065], "isController": true}, {"data": ["1.2 Sign-in page", 556, 0, 0.0, 751.1726618705036, 199, 3446, 591.5, 1270.6, 1373.3, 1860.4999999999925, 0.46607853590984233, 181.0664602922673, 1.960711186545], "isController": false}, {"data": ["Debug Sampler", 537, 0, 0.0, 0.5232774674115451, 0, 3, 1.0, 1.0, 1.0, 1.0, 0.45868660173873826, 2.8226449443255257, 0.0], "isController": false}, {"data": ["2.4 Patient attending session", 321, 3, 0.9345794392523364, 1081.644859813084, 482, 3148, 966.0, 1496.8000000000002, 1803.2999999999993, 2723.299999999984, 0.32738031495822073, 129.37536823114428, 1.43169428205038], "isController": false}, {"data": ["1.4 Open Sessions list", 555, 0, 0.0, 983.3045045045044, 484, 3681, 840.0, 1491.8000000000002, 1600.9999999999993, 2157.119999999988, 0.4679263863267694, 209.12653793913415, 1.6607344065112588], "isController": false}, {"data": ["4.2 Vaccination batch", 504, 0, 0.0, 855.1765873015871, 534, 3062, 830.0, 1058.5, 1171.5, 1601.5999999999997, 0.45677453735717866, 175.98285543448415, 2.0428344089210606], "isController": false}, {"data": ["1.1 Homepage", 556, 0, 0.0, 772.1330935251789, 534, 2929, 739.0, 954.1000000000001, 1069.4499999999998, 1612.909999999998, 0.4656242044190752, 180.8404642507805, 1.9406212615547662], "isController": false}, {"data": ["1.3 Sign-in", 555, 0, 0.0, 922.8594594594603, 447, 3732, 844.0, 1332.0000000000002, 1538.999999999999, 2372.479999999996, 0.4682102137316354, 182.5373869546511, 2.149944320947556], "isController": false}, {"data": ["2.2 Session register", 546, 0, 0.0, 517.9926739926735, 324, 1936, 486.0, 684.0, 799.0999999999997, 1083.489999999999, 0.464757981111759, 187.52457106578325, 1.6585165995633318], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 125, 0, 0.0, 3806.0480000000016, 1927, 6570, 3683.0, 4641.200000000001, 5206.899999999997, 6522.939999999999, 0.11501825569754431, 132.13751446785884, 1.6640625575091277], "isController": true}, {"data": ["2.1 Open session", 550, 0, 0.0, 836.872727272727, 441, 3723, 747.0, 1283.8000000000002, 1460.1499999999996, 1976.7300000000007, 0.46553319209338423, 180.2103676715024, 1.657213852088255], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 3, 100.0, 0.04105652114410839], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 7307, 3, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 3, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 321, 3, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 3, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
