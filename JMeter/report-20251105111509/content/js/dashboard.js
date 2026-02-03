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

    var data = {"OkPercent": 99.70673316708229, "KoPercent": 0.2932668329177057};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.2943198090692124, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.003098927294398093, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.028486293206197853, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.0, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.0, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.6740166865315852, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.6707985697258642, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.3455594002306805, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.11769005847953216, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [0.2717416378316032, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [0.43468414779499404, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.43771626297577854, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.3193771626297578, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.5843861740166866, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.49785458879618594, 500, 1500, "2.1 Open session"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 50125, 147, 0.2932668329177057, 1387.3820648378967, 314, 19224, 1027.0, 2151.0, 2515.0, 3608.950000000008, 9.29033516007734, 3722.985439871364, 38.67379373801755], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["4.3 Vaccination confirm", 4195, 0, 0.0, 2938.0181168057143, 1429, 17430, 2399.0, 4567.200000000001, 6166.599999999998, 10983.759999999998, 0.8018778660682371, 317.24449058414746, 4.159428756699837], "isController": false}, {"data": ["4.1 Vaccination questions", 4195, 0, 0.0, 1872.4891537544684, 530, 11141, 1666.0, 2332.4, 2864.7999999999993, 5373.079999999998, 0.8026215014934117, 310.8746169087693, 4.003745695057306], "isController": false}, {"data": ["2.0 Register attendance", 4195, 147, 3.504171632896305, 5052.927056019075, 1601, 22673, 4479.0, 7615.0, 9682.199999999986, 14460.199999999993, 0.80027669161228, 1539.7166262651335, 14.361791537233756], "isController": true}, {"data": ["1.0 Login", 4335, 0, 0.0, 5351.442675893878, 2523, 21615, 4932.0, 6827.8, 8171.999999999997, 12763.080000000016, 0.8054852523733014, 1318.432802511855, 13.360919485454719], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 1014, 0, 0.0, 5964.604536489148, 3836, 22441, 5370.5, 8211.5, 9844.5, 16146.000000000013, 0.21287776092903718, 249.5947198491796, 3.1214461327941554], "isController": true}, {"data": ["2.5 Select patient", 4195, 0, 0.0, 737.9237187127549, 351, 8372, 534.0, 1328.2000000000003, 1780.5999999999995, 3691.119999999999, 0.8026411581757947, 319.6129405169, 2.8528987653891376], "isController": false}, {"data": ["2.3 Search by first/last name", 4195, 0, 0.0, 676.2333730631727, 348, 8717, 542.0, 1053.4, 1369.1999999999998, 2474.039999999999, 0.800653654024864, 319.96690722022595, 2.977031723956664], "isController": false}, {"data": ["4.0 Vaccination for flu", 1017, 0, 0.0, 6025.61356932154, 3682, 20560, 5330.0, 8475.6, 10856.999999999998, 15495.119999999999, 0.2135215626335166, 250.63729545882205, 3.1242817742576348], "isController": true}, {"data": ["4.0 Vaccination for hpv", 1147, 0, 0.0, 5902.636442894507, 3748, 27421, 5168.0, 8229.2, 10413.799999999997, 16781.639999999992, 0.21963389117533236, 256.90965998610386, 3.2189432073934663], "isController": true}, {"data": ["1.2 Sign-in page", 4335, 0, 0.0, 1271.310265282585, 314, 11381, 995.0, 2060.4, 2538.0, 4696.480000000002, 0.8058693313087764, 318.08757328199954, 3.450353549027157], "isController": false}, {"data": ["2.4 Patient attending session", 3420, 147, 4.298245614035087, 2301.1108187134478, 374, 19224, 1827.5, 3752.8, 4900.0499999999965, 8994.559999999994, 0.717323552563771, 284.58433354054705, 3.1196925824182737], "isController": false}, {"data": ["1.4 Open Sessions list", 4335, 0, 0.0, 1630.2216839677028, 750, 7759, 1418.0, 2426.8, 2756.3999999999996, 4021.8000000000065, 0.8057613329355642, 364.5857335329498, 2.863669758148459], "isController": false}, {"data": ["4.2 Vaccination batch", 4195, 0, 0.0, 1184.008343265795, 512, 10765, 1004.0, 1673.4, 2177.3999999999987, 4441.639999999999, 0.8025023534648876, 312.9247619878691, 3.5934168470423815], "isController": false}, {"data": ["1.1 Homepage", 4335, 0, 0.0, 1077.7817762399109, 502, 9797, 877.0, 1657.0, 2176.0, 4608.520000000014, 0.8060485436459947, 318.4852597998118, 3.438366551574649], "isController": false}, {"data": ["1.3 Sign-in", 4335, 0, 0.0, 1372.1289504036895, 500, 9550, 1200.0, 2043.4, 2512.2, 4878.520000000006, 0.8058320304011519, 317.91013141266166, 3.615113806986127], "isController": false}, {"data": ["2.2 Session register", 4195, 0, 0.0, 792.6271752085813, 346, 7658, 662.0, 1230.4, 1632.0, 3647.0399999999963, 0.8005172161770504, 330.2578293449121, 2.8564744116794794], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 1017, 0, 0.0, 6096.864306784663, 3814, 24080, 5363.0, 8558.0, 10697.599999999991, 16757.679999999924, 0.21489326545213586, 252.69933685413426, 3.1506191496655522], "isController": true}, {"data": ["2.1 Open session", 4195, 0, 0.0, 970.1477949940399, 374, 7922, 846.0, 1487.0, 1864.199999999999, 3868.6799999999957, 0.8003999137590557, 312.2791409903494, 2.849021078231221], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 147, 100.0, 0.2932668329177057], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 50125, 147, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 147, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 3420, 147, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 147, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
