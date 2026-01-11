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

    var data = {"OkPercent": 99.943904263276, "KoPercent": 0.05609573672400898};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.23284483612238835, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.12976539589442815, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.0, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.0, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.3786231884057971, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.4884309472161967, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.4087694483734088, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.0, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [0.0, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [0.30947136563876654, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.3439265536723164, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.38208215297450426, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.4851985559566787, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.4535637149028078, 500, 1500, "2.1 Open session"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 16044, 9, 0.05609573672400898, 2492.2609698329616, 254, 19702, 1358.0, 4566.0, 12205.75, 13583.749999999996, 4.447250848342759, 1815.7860835380272, 18.490882160395408], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["4.3 Vaccination confirm", 1347, 0, 0.0, 3508.118040089087, 2265, 12551, 3338.0, 4540.2, 5049.799999999999, 7139.959999999996, 0.3886879401414801, 156.80273385931488, 2.016119742108293], "isController": false}, {"data": ["4.1 Vaccination questions", 1364, 0, 0.0, 1872.9596774193544, 1019, 7605, 1900.0, 2333.0, 2682.25, 3754.149999999999, 0.3877920558920937, 153.1035068731806, 1.9275733634016698], "isController": false}, {"data": ["2.0 Register attendance", 1382, 9, 0.6512301013024602, 5283.206946454411, 2328, 15135, 5660.0, 7304.8, 7889.299999999998, 9958.370000000004, 0.3878050737924025, 720.8926553139853, 6.542492696998383], "isController": true}, {"data": ["1.0 Login", 1412, 0, 0.0, 16467.593484419296, 2843, 30737, 16172.0, 18259.0, 19211.75, 22684.489999999965, 0.39279056835293064, 654.0659239647033, 6.527197584730934], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 334, 0, 0.0, 6881.868263473057, 3387, 13502, 6611.0, 8202.0, 8735.75, 11609.599999999995, 0.09712597267735887, 115.9951887770684, 1.4193683447625982], "isController": true}, {"data": ["2.5 Select patient", 1380, 0, 0.0, 1110.9492753623172, 593, 5069, 988.5, 1678.7000000000003, 1862.95, 2330.9500000000003, 0.388428872762523, 158.01738490560476, 1.3806415555492695], "isController": false}, {"data": ["2.3 Search by first/last name", 1383, 0, 0.0, 792.6066522053515, 588, 7353, 689.0, 1028.6000000000001, 1226.6, 1902.2400000000032, 0.3884460472876186, 158.20447230812226, 1.444279746632344], "isController": false}, {"data": ["4.0 Vaccination for flu", 338, 0, 0.0, 7002.822485207102, 5426, 15430, 6710.0, 8306.000000000002, 9310.400000000001, 12386.970000000014, 0.09812713618856203, 117.27883048702341, 1.433951501025835], "isController": true}, {"data": ["4.0 Vaccination for hpv", 352, 0, 0.0, 6937.230113636361, 3293, 12096, 6658.0, 8338.1, 9022.1, 11948.279999999997, 0.10102764053102654, 119.73326996533632, 1.4683236102600457], "isController": true}, {"data": ["1.2 Sign-in page", 1414, 0, 0.0, 1213.7673267326745, 254, 7736, 1084.0, 1763.5, 2002.5, 3153.3999999999924, 0.39342550916467195, 158.12767743327, 1.679067294873393], "isController": false}, {"data": ["2.4 Patient attending session", 781, 9, 1.1523687580025608, 2615.9782330345706, 787, 11065, 2437.0, 3493.6000000000013, 4003.3999999999996, 5320.139999999997, 0.2299384583406569, 93.88396765047794, 1.0052041770153692], "isController": false}, {"data": ["1.4 Open Sessions list", 1411, 0, 0.0, 12498.657689581858, 9725, 19702, 12330.0, 13708.4, 14684.8, 16683.64, 0.39250288883238876, 180.45243191537028, 1.3946005804126036], "isController": false}, {"data": ["4.2 Vaccination batch", 1362, 0, 0.0, 1566.752569750368, 1027, 7649, 1441.0, 2007.3000000000004, 2359.2999999999984, 3725.1499999999896, 0.3883020168612026, 154.33072914662077, 1.7383629313837263], "isController": false}, {"data": ["1.1 Homepage", 1416, 0, 0.0, 1469.5663841807905, 1018, 5763, 1374.0, 1878.1999999999998, 2224.2999999999997, 3170.5599999999904, 0.3934467771540794, 157.96580478230598, 1.6712818537157381], "isController": false}, {"data": ["1.3 Sign-in", 1412, 0, 0.0, 1294.4688385269126, 721, 9787, 1155.5, 1799.0, 2039.499999999999, 3452.889999999995, 0.3934327930691185, 158.29404875606136, 1.790713920304225], "isController": false}, {"data": ["2.2 Session register", 1385, 0, 0.0, 833.6635379061352, 584, 3978, 749.0, 1127.2000000000003, 1286.8000000000002, 2072.920000000003, 0.3882588287534677, 161.3706032381452, 1.3863310058419638], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 336, 0, 0.0, 6830.860119047621, 3389, 13280, 6652.5, 7920.8, 8545.35, 11729.489999999994, 0.09797692235241424, 116.88467321634617, 1.4286074324608042], "isController": true}, {"data": ["2.1 Open session", 1389, 0, 0.0, 1068.5449964002908, 633, 7361, 987.0, 1463.0, 1678.0, 2369.299999999999, 0.3885990793363209, 155.15751288362267, 1.384106636875003], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 9, 100.0, 0.05609573672400898], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 16044, 9, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 9, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 781, 9, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 9, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
