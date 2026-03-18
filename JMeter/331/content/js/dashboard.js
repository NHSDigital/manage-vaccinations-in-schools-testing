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

    var data = {"OkPercent": 99.99149732165633, "KoPercent": 0.008502678343678259};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.7468988391376451, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.5133531157270029, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.9992570579494799, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.9117647058823529, 500, 1500, "7.1 Full name search"], "isController": false}, {"data": [0.9977777777777778, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.5247252747252747, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.5198863636363636, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.7481536189069424, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.3972602739726027, 500, 1500, "7.2 First name search"], "isController": false}, {"data": [0.4861111111111111, 500, 1500, "7.7 Due vaccination search"], "isController": false}, {"data": [0.9595300261096605, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Check STS status"], "isController": false}, {"data": [0.7485272459499264, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.7511111111111111, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.4585987261146497, 500, 1500, "Run some searches"], "isController": true}, {"data": [0.5, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.9622781065088757, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.8672360248447205, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.9977307110438729, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [1.0, 500, 1500, "Reset counters"], "isController": false}, {"data": [0.33727810650887574, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.5, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.4740973312401884, 500, 1500, "7.0 Open Children Search"], "isController": false}, {"data": [1.0, 500, 1500, "Initialise vaccination list"], "isController": false}, {"data": [0.0, 500, 1500, "7.8 Year group search"], "isController": false}, {"data": [0.49193548387096775, 500, 1500, "7.9 DOB search"], "isController": false}, {"data": [0.36538461538461536, 500, 1500, "7.4 Partial name search"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.8523206751054853, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [1.0, 500, 1500, "Reset vaccination list"], "isController": false}, {"data": [0.9992424242424243, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.0, 500, 1500, "7.5 Needs Consent search"], "isController": false}, {"data": [0.9992592592592593, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [1.0, 500, 1500, "7.6 Needs triage search"], "isController": false}, {"data": [0.453125, 500, 1500, "7.3 Last name search"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 11761, 1, 0.008502678343678259, 790.9246662698729, 0, 19562, 176.0, 1224.6000000000022, 1946.699999999999, 14877.0, 6.073880197735503, 324.32490515856335, 47.03310705459158], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["2.0 Register attendance", 674, 1, 0.14836795252225518, 838.0044510385754, 390, 1527, 825.5, 1112.5, 1196.25, 1353.75, 0.38205411337370787, 55.69990775114957, 13.026295129433585], "isController": true}, {"data": ["2.5 Select patient", 673, 0, 0.0, 105.10252600297179, 56, 530, 88.0, 154.60000000000002, 250.0, 359.81999999999994, 0.38206204505947794, 9.638872133363781, 2.7552389699099176], "isController": false}, {"data": ["7.1 Full name search", 68, 0, 0.0, 389.25000000000006, 140, 1777, 256.5, 903.4, 1296.9999999999993, 1777.0, 0.04145613453247234, 1.5348474151338058, 0.3059235538972424], "isController": false}, {"data": ["2.3 Search by first/last name", 675, 0, 0.0, 103.08148148148145, 60, 653, 86.0, 157.0, 215.0, 346.8000000000002, 0.3812047425258457, 10.9713785787713, 2.8507204301951994], "isController": false}, {"data": ["4.0 Vaccination for flu", 182, 0, 0.0, 698.2747252747251, 191, 1407, 670.0, 941.8000000000004, 1098.6999999999998, 1392.8899999999999, 0.10640897764359074, 5.5191937751332745, 2.980887342527868], "isController": true}, {"data": ["4.0 Vaccination for hpv", 176, 0, 0.0, 689.0738636363635, 171, 1484, 661.5, 910.4000000000001, 1054.5, 1380.8199999999986, 0.10324524441258442, 5.002178929288153, 2.904881006006116], "isController": true}, {"data": ["1.2 Sign-in page", 1354, 0, 0.0, 1204.3655834564238, 12, 18755, 156.0, 1857.5, 5581.75, 15149.100000000004, 0.7506246427741845, 47.5055438432148, 6.358657954064156], "isController": false}, {"data": ["7.2 First name search", 73, 0, 0.0, 1496.6712328767128, 599, 6295, 1124.0, 3143.200000000001, 4105.0999999999985, 6295.0, 0.042375291838054406, 5.657115065461118, 0.31240836978043796], "isController": false}, {"data": ["7.7 Due vaccination search", 72, 0, 0.0, 854.2361111111113, 691, 1820, 771.5, 1169.4, 1422.2499999999998, 1820.0, 0.044649999813958334, 5.86545042315177, 0.33785214974245636], "isController": false}, {"data": ["2.4 Patient attending session", 383, 1, 0.26109660574412535, 336.402088772846, 219, 773, 307.0, 474.4000000000001, 520.5999999999999, 679.079999999998, 0.24175141642344244, 7.25554564651777, 2.1210211466607376], "isController": false}, {"data": ["Check STS status", 1, 0, 0.0, 27.0, 27, 27, 27.0, 27.0, 27.0, 27.0, 37.03703703703704, 11.610243055555555, 21.846064814814817], "isController": false}, {"data": ["1.1 Homepage", 1358, 0, 0.0, 1192.210603829161, 27, 19562, 154.5, 1851.3000000000004, 5365.0499999999965, 15119.28, 0.7540586177850112, 68.64611467809388, 6.3703738470829645], "isController": false}, {"data": ["1.3 Sign-in", 1350, 0, 0.0, 1217.9896296296304, 58, 18054, 224.5, 1879.0, 5431.500000000013, 15455.67, 0.7520447260496038, 48.08154217285776, 6.70737016626734], "isController": false}, {"data": ["Run some searches", 628, 0, 0.0, 2453.7101910828014, 0, 16277, 994.5, 12786.200000000003, 14631.2, 15617.580000000004, 0.35356279258306333, 40.28132651055903, 2.632894046752768], "isController": true}, {"data": ["4.0 Vaccination for td_ipv", 150, 0, 0.0, 721.1533333333331, 517, 1418, 676.0, 935.0, 1010.0, 1369.5500000000009, 0.1003946177776112, 5.0516741555474045, 2.8663042469767834], "isController": true}, {"data": ["2.1 Open session", 676, 0, 0.0, 310.16568047337284, 129, 1017, 299.5, 478.30000000000007, 534.15, 733.7500000000005, 0.3800274226888739, 8.68614298131232, 2.7404066968027663], "isController": false}, {"data": ["4.3 Vaccination confirm", 644, 0, 0.0, 471.8711180124224, 320, 1222, 430.0, 633.5, 730.0, 995.9999999999982, 0.3861390472318807, 8.212579040646832, 3.9800025018092775], "isController": false}, {"data": ["4.1 Vaccination questions", 661, 0, 0.0, 129.86838124054472, 74, 686, 106.0, 202.0, 254.69999999999993, 455.65999999999997, 0.38639492367092715, 5.44800264586993, 3.62138718371588], "isController": false}, {"data": ["Reset counters", 1, 0, 0.0, 15.0, 15, 15, 15.0, 15.0, 15.0, 15.0, 66.66666666666667, 0.0, 0.0], "isController": false}, {"data": ["1.0 Login", 1352, 0, 0.0, 3828.9711538461524, 232, 49527, 860.0, 5621.4, 16495.049999999945, 46142.94, 0.7532872743481167, 197.04503439624193, 22.30705109900825], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 152, 0, 0.0, 720.8947368421051, 533, 1350, 663.0, 959.1, 1144.9999999999998, 1347.35, 0.1003087132635836, 5.3905589816471355, 2.8640442221191273], "isController": true}, {"data": ["7.0 Open Children Search", 637, 0, 0.0, 2389.3453689167977, 78, 18336, 945.0, 6803.600000000042, 14621.7, 15610.84, 0.35547529614105616, 39.061577916194885, 2.5634267661597563], "isController": false}, {"data": ["Initialise vaccination list", 1, 0, 0.0, 42.0, 42, 42, 42.0, 42.0, 42.0, 42.0, 23.809523809523807, 6.8359375, 14.694940476190474], "isController": false}, {"data": ["7.8 Year group search", 74, 0, 0.0, 1929.6891891891894, 1730, 4263, 1823.5, 2065.5, 2403.75, 4263.0, 0.04211578311737612, 5.714431922824535, 0.32029693334494364], "isController": false}, {"data": ["7.9 DOB search", 62, 0, 0.0, 908.0806451612901, 697, 1588, 837.0, 1169.6000000000001, 1365.9499999999994, 1588.0, 0.0377884723217725, 5.105705442210455, 0.28470514058835433], "isController": false}, {"data": ["7.4 Partial name search", 78, 0, 0.0, 1759.4615384615388, 685, 7744, 1232.0, 3353.1000000000004, 5624.149999999997, 7744.0, 0.04633832202995119, 6.199001390595222, 0.3415884825060953], "isController": false}, {"data": ["Debug Sampler", 675, 0, 0.0, 0.30814814814814856, 0, 3, 0.0, 1.0, 1.0, 1.0, 0.3812226119792005, 2.088630555366513, 0.0], "isController": false}, {"data": ["1.4 Open Sessions list", 711, 0, 0.0, 440.6638537271444, 320, 1270, 380.0, 606.0000000000003, 671.4, 866.04, 0.39825440222350306, 32.913564253145566, 2.87053605686692], "isController": false}, {"data": ["Reset vaccination list", 1, 0, 0.0, 2.0, 2, 2, 2.0, 2.0, 2.0, 2.0, 500.0, 143.06640625, 307.12890625], "isController": false}, {"data": ["4.2 Vaccination batch", 660, 0, 0.0, 115.89696969696972, 73, 502, 98.0, 174.0, 225.89999999999986, 344.16999999999996, 0.38633362366890506, 6.251096852741916, 3.4239491926651637], "isController": false}, {"data": ["7.5 Needs Consent search", 63, 0, 0.0, 14578.603174603177, 12777, 16277, 14629.0, 15606.8, 15836.199999999999, 16277.0, 0.040329859844134695, 5.461935333950445, 0.30547405729752813], "isController": false}, {"data": ["2.2 Session register", 675, 0, 0.0, 128.0725925925925, 58, 525, 92.0, 229.0, 262.0, 376.6800000000003, 0.3815016356529386, 17.69973692547973, 2.7543833036656937], "isController": false}, {"data": ["7.6 Needs triage search", 71, 0, 0.0, 174.95774647887325, 120, 411, 155.0, 237.0, 299.79999999999984, 411.0, 0.043482467991391695, 2.369586375319841, 0.32939117808091656], "isController": false}, {"data": ["7.3 Last name search", 64, 0, 0.0, 1195.1406249999998, 632, 4730, 1036.5, 1674.0, 2978.25, 4730.0, 0.03888546953293083, 5.20879515366292, 0.2866907426836078], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 1, 100.0, 0.008502678343678259], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 11761, 1, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 1, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 383, 1, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
