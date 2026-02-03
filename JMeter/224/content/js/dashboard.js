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

    var data = {"OkPercent": 99.84384149912161, "KoPercent": 0.15615850087839156};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.8054667394525462, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "7.3 Safe to vaccinate"], "isController": false}, {"data": [0.3385964912280702, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.9952996474735605, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.0, 500, 1500, "7.1 Full name search"], "isController": false}, {"data": [0.9930313588850174, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.471563981042654, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.4611872146118721, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.0, 500, 1500, "7.6 First name search"], "isController": false}, {"data": [0.9796149490373726, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.6243016759776536, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Check STS status"], "isController": false}, {"data": [0.9819209039548022, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.9722536806342016, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.0, 500, 1500, "Run some searches"], "isController": true}, {"data": [0.455, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.8591954022988506, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.0, 500, 1500, "7.7 Partial name search"], "isController": false}, {"data": [0.4956521739130435, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.9897836538461539, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.0, 500, 1500, "7.7 Last name search"], "isController": false}, {"data": [1.0, 500, 1500, "Reset counters"], "isController": false}, {"data": [0.485277463193658, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.457286432160804, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.09090909090909091, 500, 1500, "7.0 Open Children Search"], "isController": false}, {"data": [1.0, 500, 1500, "Initialise vaccination list"], "isController": false}, {"data": [0.35, 500, 1500, "7.5 year group"], "isController": false}, {"data": [0.0, 500, 1500, "7.2 No Consent search"], "isController": false}, {"data": [0.9357798165137615, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [1.0, 500, 1500, "Reset vaccination list"], "isController": false}, {"data": [0.9939686369119421, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.9826388888888888, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.9, 500, 1500, "7.3 Due vaccination"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 10246, 16, 0.15615850087839156, 323.75814952176563, 2, 10414, 156.0, 677.0, 878.0, 1879.4200000000092, 5.345319871432693, 2189.542119378441, 25.728246276900716], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["7.3 Safe to vaccinate", 10, 0, 0.0, 139.0, 77, 460, 106.0, 428.2000000000001, 460.0, 460.0, 0.006522918927945228, 2.6696256019838804, 0.028523119222324558], "isController": false}, {"data": ["2.0 Register attendance", 855, 13, 1.5204678362573099, 1384.2187134502924, 475, 4253, 1340.0, 1910.8, 2159.399999999999, 3197.239999999999, 0.4855160069800734, 958.9645965667205, 10.217919827075383], "isController": true}, {"data": ["2.5 Select patient", 851, 0, 0.0, 131.0282021151587, 60, 1230, 103.0, 227.80000000000007, 288.4, 495.6800000000003, 0.48212238090274157, 196.0816565526366, 2.0032003900460706], "isController": false}, {"data": ["7.1 Full name search", 10, 0, 0.0, 6566.3, 6075, 7741, 6484.0, 7658.1, 7741.0, 7741.0, 0.006456015489272362, 3.2044540060948012, 0.027913440407426226], "isController": false}, {"data": ["2.3 Search by first/last name", 861, 0, 0.0, 120.65272938443667, 56, 1645, 95.0, 187.80000000000007, 243.89999999999998, 530.1399999999998, 0.48569813606994056, 197.96021767004794, 2.097713824408842], "isController": false}, {"data": ["4.0 Vaccination for flu", 211, 1, 0.47393364928909953, 1067.8151658767772, 138, 2928, 1021.0, 1479.0, 1676.5999999999985, 2368.5999999999995, 0.12352147429611784, 145.71231376192407, 2.0583409832982578], "isController": true}, {"data": ["4.0 Vaccination for hpv", 219, 0, 0.0, 1109.4429223744285, 182, 3719, 1043.0, 1490.0, 1686.0, 2448.400000000005, 0.12984241044431005, 153.71870815046452, 2.180734247899695], "isController": true}, {"data": ["7.6 First name search", 10, 0, 0.0, 5399.5, 4849, 6442, 5370.5, 6393.900000000001, 6442.0, 6442.0, 0.006496054296620233, 3.183365398466347, 0.0280351687041541], "isController": false}, {"data": ["1.2 Sign-in page", 883, 0, 0.0, 202.11551528878817, 14, 6818, 117.0, 246.60000000000002, 349.5999999999999, 4716.799999999995, 0.49392246032678316, 198.92300297986134, 2.425758678603592], "isController": false}, {"data": ["2.4 Patient attending session", 716, 13, 1.8156424581005586, 653.2667597765367, 48, 2778, 579.5, 939.6000000000001, 1114.6999999999996, 1778.4200000000112, 0.4080502152521876, 166.75791748673268, 2.075094716910889], "isController": false}, {"data": ["Check STS status", 1, 0, 0.0, 31.0, 31, 31, 31.0, 31.0, 31.0, 31.0, 32.25806451612903, 10.112147177419354, 19.027217741935484], "isController": false}, {"data": ["1.1 Homepage", 885, 0, 0.0, 210.76158192090392, 29, 6653, 128.0, 273.9999999999999, 378.39999999999986, 4610.319999999998, 0.49185903820160776, 197.87944742954326, 2.4021222223858665], "isController": false}, {"data": ["1.3 Sign-in", 883, 0, 0.0, 238.82559456398636, 71, 5977, 130.0, 363.20000000000005, 465.79999999999995, 4637.839999999991, 0.49417317775739394, 199.36463895171764, 2.5844245231270806], "isController": false}, {"data": ["Run some searches", 10, 0, 0.0, 27949.1, 23884, 41577, 26446.5, 40421.3, 41577.0, 41577.0, 0.006393767866585082, 24.871292453819414, 0.2224388094436591], "isController": true}, {"data": ["4.0 Vaccination for td_ipv", 200, 0, 0.0, 1143.4000000000003, 217, 3884, 1079.0, 1581.6000000000004, 1801.75, 3276.6000000000067, 0.11827677830614643, 140.69902925073436, 1.9856395635675588], "isController": true}, {"data": ["2.1 Open session", 870, 0, 0.0, 443.1689655172416, 203, 2165, 383.0, 685.8, 837.0, 1231.659999999998, 0.48812701177059376, 196.77248182130145, 2.031524045445186], "isController": false}, {"data": ["7.7 Partial name search", 10, 0, 0.0, 5743.5, 4464, 7031, 5786.0, 7001.2, 7031.0, 7031.0, 0.0065047461880561154, 3.0664542352077193, 0.028066328205750328], "isController": false}, {"data": ["4.3 Vaccination confirm", 805, 1, 0.12422360248447205, 816.5652173913047, 51, 3639, 741.0, 1168.1999999999998, 1330.0, 1880.959999999995, 0.4827875734676742, 194.98639934366378, 2.9091980778457476], "isController": false}, {"data": ["4.1 Vaccination questions", 832, 1, 0.1201923076923077, 161.4795673076923, 54, 2935, 131.0, 229.70000000000005, 292.1499999999992, 589.0699999999991, 0.48407751523942344, 191.08769514465743, 2.7616795882490184], "isController": false}, {"data": ["7.7 Last name search", 10, 0, 0.0, 5588.6, 4839, 7422, 5339.5, 7347.6, 7422.0, 7422.0, 0.006493375782695284, 3.2226960092442947, 0.028028681930753342], "isController": false}, {"data": ["Reset counters", 1, 0, 0.0, 20.0, 20, 20, 20.0, 20.0, 20.0, 20.0, 50.0, 0.0, 0.0], "isController": false}, {"data": ["1.0 Login", 883, 0, 0.0, 992.8074745186855, 456, 19448, 752.0, 1167.8000000000002, 1412.7999999999997, 14313.519999999997, 0.4938926233808656, 821.2389353964118, 9.44561503457668], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 199, 0, 0.0, 1094.1557788944717, 182, 3440, 1032.0, 1520.0, 1723.0, 2102.0, 0.11780850139298192, 139.54520995128854, 1.974219714779106], "isController": true}, {"data": ["7.0 Open Children Search", 11, 0, 0.0, 4659.181818181819, 122, 5773, 5153.0, 5747.8, 5773.0, 5773.0, 0.0064058626454931555, 2.9768255270860258, 0.026594225398721274], "isController": false}, {"data": ["Initialise vaccination list", 1, 0, 0.0, 44.0, 44, 44, 44.0, 44.0, 44.0, 44.0, 22.727272727272727, 6.525213068181818, 14.026988636363637], "isController": false}, {"data": ["7.5 year group", 10, 0, 0.0, 1488.3, 1338, 1753, 1450.5, 1742.0, 1753.0, 1753.0, 0.006512778396853546, 3.2353371510697566, 0.02863778055421139], "isController": false}, {"data": ["7.2 No Consent search", 10, 0, 0.0, 2536.6000000000004, 1534, 10414, 1652.0, 9559.800000000003, 10414.0, 10414.0, 0.006482116488818998, 3.444929037232305, 0.02845864365115583], "isController": false}, {"data": ["1.4 Open Sessions list", 872, 0, 0.0, 345.62729357798196, 176, 2648, 290.0, 539.7, 693.0499999999997, 992.7999999999993, 0.4882552768804967, 224.61363896601867, 2.0272823572007295], "isController": false}, {"data": ["Reset vaccination list", 1, 0, 0.0, 2.0, 2, 2, 2.0, 2.0, 2.0, 2.0, 500.0, 143.06640625, 307.12890625], "isController": false}, {"data": ["4.2 Vaccination batch", 829, 1, 0.12062726176115803, 149.08685162846794, 33, 1489, 120.0, 237.0, 307.0, 521.6000000000026, 0.48439760570852936, 192.50025194043897, 2.516296789434289], "isController": false}, {"data": ["2.2 Session register", 864, 0, 0.0, 144.86458333333343, 56, 1848, 97.0, 283.0, 405.0, 775.1000000000006, 0.48631753495547997, 202.9424808630321, 2.0282502239509137], "isController": false}, {"data": ["7.3 Due vaccination", 10, 0, 0.0, 487.3, 285, 1113, 423.5, 1060.8000000000002, 1113.0, 1113.0, 0.006516500430740678, 3.247296894529137, 0.028405959934274576], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /Check and confirm/", 1, 6.25, 0.009759906304899472], "isController": false}, {"data": ["Test failed: text expected to contain /Which batch did you use?/", 1, 6.25, 0.009759906304899472], "isController": false}, {"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 13, 81.25, 0.12687878196369315], "isController": false}, {"data": ["Test failed: text expected to contain /Vaccination outcome recorded for/", 1, 6.25, 0.009759906304899472], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 10246, 16, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 13, "Test failed: text expected to contain /Check and confirm/", 1, "Test failed: text expected to contain /Which batch did you use?/", 1, "Test failed: text expected to contain /Vaccination outcome recorded for/", 1, "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 716, 13, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 13, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["4.3 Vaccination confirm", 805, 1, "Test failed: text expected to contain /Vaccination outcome recorded for/", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["4.1 Vaccination questions", 832, 1, "Test failed: text expected to contain /Which batch did you use?/", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["4.2 Vaccination batch", 829, 1, "Test failed: text expected to contain /Check and confirm/", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
